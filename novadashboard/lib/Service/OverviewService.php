<?php

declare(strict_types=1);

namespace OCA\NovaDashboard\Service;

use DateTimeImmutable;
use DateTimeZone;
use OCP\App\IAppManager;
use OCP\Calendar\IManager as ICalendarManager;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Files\IRootFolder;
use OCP\IURLGenerator;
use OCP\IUser;
use OCP\IConfig;
use OCP\IGroupManager;
use Throwable;

final class OverviewService {
    public function __construct(
        private IRootFolder $root,
        private ICalendarManager $calendars,
        private IURLGenerator $url,
        private IAppManager $apps,
        private IConfig $config,
        private IGroupManager $groups,
    ) {}

    public function build(IUser $user): array {
        $uid = $user->getUID();
        $result = [
            'storage' => ['used' => null, 'total' => null, 'percent' => null],
            'files' => [],
            'calendar' => [],
            'tasks' => [],
            'shortcuts' => [],
            'warnings' => [],
        ];

        try {
            $userFolder = $this->root->getUserFolder($uid);
            $used = max(0, (int)$userFolder->getSize(false));
            $quota = $user->getQuotaBytes();
            $total = $quota > 0 ? (int)$quota : null;
            $result['storage'] = [
                'used' => $used,
                'total' => $total,
                'percent' => $total !== null ? min(100, round(($used / $total) * 100, 1)) : null,
                'label' => 'Fichiers personnels',
            ];
            $result['files'] = $this->recentFiles($userFolder, $uid);
            if ($this->groups->isAdmin($uid)) {
                $volume = $this->volumeCapacity();
                if ($volume !== null) {
                    $result['storage']['volume'] = $volume;
                }
            }
        } catch (Throwable $error) {
            $result['warnings'][] = 'Les informations de fichiers sont momentanément indisponibles.';
        }

        try {
            [$result['calendar'], $result['tasks']] = $this->calendarItems($uid);
        } catch (Throwable $error) {
            $result['warnings'][] = 'Calendrier et tâches momentanément indisponibles.';
        }

        foreach ($this->catalog() as $link) {
            try {
                if (!$this->apps->isEnabledForUser($link['app'], $user)) {
                    continue;
                }
                $result['shortcuts'][] = [
                    'id' => $link['id'],
                    'label' => $link['label'],
                    'icon' => $link['icon'],
                    'url' => $this->url->getWebroot() . '/index.php/apps/' . $link['app'] . '/',
                ];
            } catch (Throwable $error) {
                // App availability must not break the dashboard.
            }
        }
        return $result;
    }

    /**
     * The data-directory's filesystem capacity, not the raw NAS/RAID capacity.
     * Administrators only: filesystem-wide usage may contain other users' data.
     */
    private function volumeCapacity(): ?array {
        $dataDirectory = $this->config->getSystemValue('datadirectory', '');
        if (!is_string($dataDirectory) || $dataDirectory === '' || !is_dir($dataDirectory)) {
            return null;
        }
        try {
            $total = @disk_total_space($dataDirectory);
            $free = @disk_free_space($dataDirectory);
            if (!is_numeric($total) || !is_numeric($free) || $total <= 0 || $free < 0) {
                return null;
            }
            $capacity = (int)$total;
            $available = min($capacity, (int)$free);
            return [
                'total' => $capacity,
                'free' => $available,
                'used' => max(0, $capacity - $available),
                'percent' => round((($capacity - $available) / $capacity) * 100, 1),
                'label' => 'Volume contenant les données Nextcloud',
                'note' => 'Capacité du système de fichiers, pas capacité brute des disques du NAS',
            ];
        } catch (Throwable $error) {
            return null;
        }
    }

    private function catalog(): array {
        return [
            ['id' => 'files', 'label' => 'Fichiers', 'icon' => 'folder', 'app' => 'files'],
            ['id' => 'photos', 'label' => 'Photos', 'icon' => 'image', 'app' => 'photos'],
            ['id' => 'calendar', 'label' => 'Agenda', 'icon' => 'calendar', 'app' => 'calendar'],
            ['id' => 'tasks', 'label' => 'Tâches', 'icon' => 'check', 'app' => 'tasks'],
            ['id' => 'talk', 'label' => 'Talk', 'icon' => 'message', 'app' => 'spreed'],
            ['id' => 'contacts', 'label' => 'Contacts', 'icon' => 'users', 'app' => 'contacts'],
            ['id' => 'mail', 'label' => 'Mail', 'icon' => 'mail', 'app' => 'mail'],
            ['id' => 'deck', 'label' => 'Deck', 'icon' => 'kanban', 'app' => 'deck'],
            ['id' => 'notes', 'label' => 'Notes', 'icon' => 'note', 'app' => 'notes'],
            ['id' => 'bookmarks', 'label' => 'Bookmarks', 'icon' => 'star', 'app' => 'bookmarks'],
            ['id' => 'news', 'label' => 'News', 'icon' => 'news', 'app' => 'news'],
            ['id' => 'maps', 'label' => 'Maps', 'icon' => 'map', 'app' => 'maps'],
            ['id' => 'tables', 'label' => 'Tables', 'icon' => 'grid', 'app' => 'tables'],
            ['id' => 'office', 'label' => 'Office', 'icon' => 'file', 'app' => 'richdocuments'],
            ['id' => 'activity', 'label' => 'Activité', 'icon' => 'bolt', 'app' => 'activity'],
        ];
    }

    private function recentFiles(Folder $userFolder, string $uid): array {
        $queue = [[$userFolder, 0]];
        $visited = 0;
        $candidates = [];
        $filesBase = $this->url->getWebroot() . '/index.php/apps/files/';
        while ($queue !== [] && $visited < 220) {
            [$folder, $depth] = array_shift($queue);
            try {
                $children = $folder->getDirectoryListing();
            } catch (Throwable $error) {
                continue;
            }
            usort($children, static fn($a, $b): int => $b->getMTime() <=> $a->getMTime());
            foreach ($children as $node) {
                if (++$visited > 220) {
                    break;
                }
                if ($node instanceof Folder) {
                    if ($depth < 2) {
                        $queue[] = [$node, $depth + 1];
                    }
                    continue;
                }
                if (!($node instanceof File)) {
                    continue;
                }
                $relativePath = $userFolder->getRelativePath($node->getPath());
                if ($relativePath === null) {
                    continue;
                }
                $dir = dirname($relativePath);
                $folderPath = $dir === '.' ? '/' : '/' . trim($dir, '/');
                $itemPath = $folderPath === '/' ? '/' . $node->getName() : $folderPath . '/' . $node->getName();
                $candidates[] = [
                    'name' => $node->getName(),
                    'mtime' => $node->getMTime(),
                    'size' => $node->getSize(),
                    'folder' => $folderPath,
                    'path' => $itemPath,
                    'url' => $filesBase . '?dir=' . rawurlencode($folderPath) . '&scrollto=' . rawurlencode($node->getName()),
                    'mime' => $node->getMimetype(),
                    'id' => (int)$node->getId(),
                    'davUrl' => $this->url->getWebroot() . '/remote.php/dav/files/' . rawurlencode($uid) . '/' . implode('/', array_map('rawurlencode', explode('/', trim($itemPath, '/')))),
                ];
            }
        }
        usort($candidates, static fn(array $a, array $b): int => $b['mtime'] <=> $a['mtime']);
        return array_slice($candidates, 0, 10);
    }

    private function calendarItems(string $uid): array {
        $from = new DateTimeImmutable('now');
        $until = $from->modify('+30 days');
        $events = [];
        $tasks = [];
        $principal = 'principals/users/' . $uid;
        $calendars = $this->calendars->getCalendarsForPrincipal($principal);
        foreach (array_slice($calendars, 0, 25) as $calendar) {
            try {
                $entries = $calendar->search('', [], [
                    'timerange' => ['start' => $from, 'end' => $until],
                    'types' => ['VEVENT'],
                ], 35);
                foreach ($entries as $entry) {
                    foreach (($entry['objects'] ?? []) as $object) {
                        if (!is_array($object) || !isset($object['DTSTART'])) {
                            continue;
                        }
                        $start = $this->parseDate($object['DTSTART']);
                        if ($start === null || $start < $from || $start > $until) {
                            continue;
                        }
                        $events[] = [
                            'title' => $this->property($object, 'SUMMARY') ?: 'Sans titre',
                            'start' => $start->format(DATE_ATOM),
                            'calendar' => $calendar->getDisplayName() ?: 'Calendrier',
                            'color' => $calendar->getDisplayColor() ?: '#798eff',
                        ];
                    }
                }
            } catch (Throwable $error) {}
            try {
                $entries = $calendar->search('', [], ['types' => ['VTODO']], 35);
                foreach ($entries as $entry) {
                    foreach (($entry['objects'] ?? []) as $object) {
                        if (!is_array($object) || strtoupper($this->property($object, 'STATUS')) === 'COMPLETED' || isset($object['COMPLETED'])) {
                            continue;
                        }
                        $due = isset($object['DUE']) ? $this->parseDate($object['DUE']) : null;
                        $tasks[] = [
                            'title' => $this->property($object, 'SUMMARY') ?: 'Tâche sans titre',
                            'due' => $due?->format(DATE_ATOM),
                        ];
                    }
                }
            } catch (Throwable $error) {}
        }
        usort($events, static fn(array $a, array $b): int => strtotime($a['start']) <=> strtotime($b['start']));
        usort($tasks, static fn(array $a, array $b): int => ($a['due'] ? strtotime($a['due']) : PHP_INT_MAX) <=> ($b['due'] ? strtotime($b['due']) : PHP_INT_MAX));
        return [array_slice($events, 0, 8), array_slice($tasks, 0, 8)];
    }

    private function property(array $object, string $name): string {
        $value = $object[$name] ?? null;
        if (!is_array($value)) {
            return '';
        }
        return is_string($value[0] ?? null) ? trim($value[0]) : '';
    }

    private function parseDate(array $value): ?DateTimeImmutable {
        $raw = $value[0] ?? null;
        $params = $value[1] ?? [];
        if (!is_string($raw) || $raw === '') {
            return null;
        }
        $tzid = is_array($params) ? ($params['TZID'] ?? 'UTC') : 'UTC';
        try {
            $timezone = new DateTimeZone(is_string($tzid) ? $tzid : 'UTC');
        } catch (Throwable $error) {
            $timezone = new DateTimeZone('UTC');
        }
        if (preg_match('/^\d{8}$/', $raw)) {
            $format = '!Ymd';
        } elseif (preg_match('/^\d{8}T\d{6}Z$/', $raw)) {
            $format = '!Ymd\\THis\\Z';
            $timezone = new DateTimeZone('UTC');
        } elseif (preg_match('/^\d{8}T\d{6}$/', $raw)) {
            $format = '!Ymd\\THis';
        } else {
            return null;
        }
        $date = DateTimeImmutable::createFromFormat($format, $raw, $timezone);
        return $date === false ? null : $date;
    }
}
