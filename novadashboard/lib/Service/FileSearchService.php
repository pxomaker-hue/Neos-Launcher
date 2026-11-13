<?php

declare(strict_types=1);

namespace OCA\NovaDashboard\Service;

use InvalidArgumentException;
use OCP\Constants;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Files\IRootFolder;
use OCP\IUser;

/** Per-user filename search through Nextcloud's file index. */
final class FileSearchService {
    private const PAGE_SIZE = 40;

    public function __construct(private IRootFolder $root) {}

    public function search(IUser $user, string $query, string $type = 'all', string $date = 'all', string $size = 'all', string $sort = 'recent', int $offset = 0): array {
        $query = trim($query);
        $queryLength = function_exists('mb_strlen') ? mb_strlen($query, 'UTF-8') : strlen($query);
        if ($queryLength < 2 || $queryLength > 100) {
            throw new InvalidArgumentException('Saisir entre 2 et 100 caractères.');
        }

        if (!in_array($type, ['all', 'folder', 'image', 'document', 'video', 'audio', 'other'], true)
            || !in_array($date, ['all', '7', '30', '365'], true)
            || !in_array($size, ['all', 'small', 'medium', 'large', 'huge'], true)
            || !in_array($sort, ['recent', 'name', 'size'], true)) {
            throw new InvalidArgumentException('Filtres de recherche invalides.');
        }
        $cutoff = $date === 'all' ? 0 : time() - ((int)$date * 86400);
        $home = $this->root->getUserFolder($user->getUID());
        $results = [];
        foreach ($home->search($query) as $entry) {
            if (!($entry instanceof File || $entry instanceof Folder)
                || ($entry->getPermissions() & Constants::PERMISSION_READ) === 0
                || mb_stripos($entry->getName(), $query, 0, 'UTF-8') === false
                || !$this->matchesFilters($entry, $type, $cutoff, $size)) {
                continue;
            }
            $relative = $home->getRelativePath($entry->getPath());
            if (!is_string($relative) || trim($relative, '/') === '') {
                continue;
            }
            $path = '/' . ltrim($relative, '/');
            $folder = $entry instanceof Folder;
            $results[$path] = [
                'name' => $entry->getName(),
                'path' => $path,
                'parent' => dirname($path),
                'kind' => $folder ? 'folder' : 'file',
                'mtime' => (int)$entry->getMTime(),
                'size' => $folder ? null : (int)$entry->getSize(),
                'mime' => $folder ? 'httpd/unix-directory' : $entry->getMimetype(),
            ];
        }
        usort($results, static function (array $a, array $b) use ($sort): int {
            $order = match ($sort) {
                'name' => strnatcasecmp($a['name'], $b['name']),
                'size' => ($b['size'] ?? -1) <=> ($a['size'] ?? -1),
                default => $b['mtime'] <=> $a['mtime'],
            };
            return $order ?: strcmp($a['path'], $b['path']);
        });
        $total = count($results);
        $page = array_slice($results, $offset, self::PAGE_SIZE);
        $next = $offset + count($page);
        return ['items' => $page, 'total' => $total, 'nextOffset' => $next < $total ? $next : null];
    }

    private function matchesFilters(File|Folder $entry, string $type, int $cutoff, string $size): bool {
        $isFolder = $entry instanceof Folder;
        if ($cutoff > 0 && (int)$entry->getMTime() < $cutoff) {
            return false;
        }
        if ($type === 'folder' && !$isFolder) {
            return false;
        }
        if ($type !== 'all' && $type !== 'folder') {
            if ($isFolder) {
                return false;
            }
            $mime = strtolower((string)$entry->getMimetype());
            $extension = strtolower(pathinfo($entry->getName(), PATHINFO_EXTENSION));
            $isImage = str_starts_with($mime, 'image/');
            $isVideo = str_starts_with($mime, 'video/');
            $isAudio = str_starts_with($mime, 'audio/');
            $isDoc = str_starts_with($mime, 'text/')
                || in_array($extension, ['pdf', 'doc', 'docx', 'odt', 'xls', 'xlsx', 'ods', 'ppt', 'pptx', 'odp', 'txt', 'md', 'csv', 'rtf'], true);
            $accepted = match ($type) {
                'image' => $isImage,
                'video' => $isVideo,
                'audio' => $isAudio,
                'document' => $isDoc,
                'other' => !$isImage && !$isVideo && !$isAudio && !$isDoc,
                default => true,
            };
            if (!$accepted) {
                return false;
            }
        }
        if ($size !== 'all') {
            if ($isFolder) {
                return false;
            }
            $bytes = (int)$entry->getSize();
            $mib = 1024 * 1024;
            return match ($size) {
                'small' => $bytes < $mib,
                'medium' => $bytes >= $mib && $bytes < 10 * $mib,
                'large' => $bytes >= 10 * $mib && $bytes < 100 * $mib,
                'huge' => $bytes >= 100 * $mib,
                default => true,
            };
        }
        return true;
    }
}
