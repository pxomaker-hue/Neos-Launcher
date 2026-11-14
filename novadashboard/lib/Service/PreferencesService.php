<?php

declare(strict_types=1);

namespace OCA\NovaDashboard\Service;

use OCP\IConfig;

final class PreferencesService {
    public const TABS = ['home','files','photos','planning','calendar','tasks','talk','contacts','mail','activity','deck','notes'];
    public const WIDGETS = ['explorer', 'storage', 'shortcuts', 'clock', 'files', 'calendar', 'tasks', 'summary', 'links', 'notes', 'deck'];
    private const MIN_SIZE = 3;
    private const MAX_SIZE = 12;
    private const MIN_HEIGHT = 160;
    private const MAX_HEIGHT = 680;
    private const HEIGHT_STEP = 20;
    private const MAX_WIDGET_ROW = 500;
    public const ACCENTS = ['indigo', 'cyan', 'emerald', 'rose', 'amber', 'copper'];

    private const DEFAULT_SIZES = [
        'explorer' => 12, 'storage' => 3, 'shortcuts' => 6, 'clock' => 3, 'files' => 6,
        'calendar' => 6, 'tasks' => 6, 'summary' => 6, 'links' => 6, 'notes' => 6, 'deck' => 6,
    ];

    public function __construct(private IConfig $config) {}

    public function get(string $uid): array {
        $raw = $this->config->getUserValue($uid, 'novadashboard', 'preferences', '');
        $settings = json_decode($raw, true);
        return $this->normalize(is_array($settings) ? $settings : []);
    }

    public function save(string $uid, array $settings): array {
        $value = $this->normalize($settings);
        $this->config->setUserValue($uid, 'novadashboard', 'preferences', json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE));
        return $value;
    }

    public function normalize(array $data): array {
        $theme = in_array($data['theme'] ?? null, ['system', 'dark', 'light'], true) ? $data['theme'] : 'dark';
        $density = in_array($data['density'] ?? null, ['comfortable', 'compact'], true) ? $data['density'] : 'comfortable';
        $accent = in_array($data['accent'] ?? null, self::ACCENTS, true) ? $data['accent'] : 'cyan';
        // Previous Copper Circuit theme is migrated to Blue Data without touching other preferences.
        if ($accent === 'copper') {
            $accent = 'cyan';
        }
        $layout = in_array($data['layout'] ?? null, ['wide', 'focused'], true) ? $data['layout'] : 'wide';
        $motion = in_array($data['motion'] ?? null, ['full', 'subtle', 'off'], true) ? $data['motion'] : 'full';
        $launcherMode = in_array($data['launcherMode'] ?? null, ['topbar', 'widget'], true) ? $data['launcherMode'] : 'topbar';
        // Keep layouts customized in earlier versions; new users start in adaptive mode.
        $gridMode = in_array($data['gridMode'] ?? null, ['adaptive', 'manual'], true) ? $data['gridMode'] : (isset($data['sizes']) ? 'manual' : 'adaptive');

        $ordered = is_array($data['order'] ?? null) ? $data['order'] : [];
        $order = [];
        foreach ($ordered as $widget) {
            if (is_string($widget) && in_array($widget, self::WIDGETS, true) && !in_array($widget, $order, true)) {
                $order[] = $widget;
            }
        }
        if (!in_array('explorer', $order, true)) {
            array_unshift($order, 'explorer');
        }
        foreach (self::WIDGETS as $widget) {
            if (!in_array($widget, $order, true)) {
                $order[] = $widget;
            }
        }

        $hiddenRequested = is_array($data['hidden'] ?? null) ? $data['hidden'] : ['links', 'notes'];
        $legacy = !isset($data['sizes']) && !isset($data['density']) && !isset($data['accent']);
        if ($legacy) {
            $hiddenRequested = array_merge($hiddenRequested, ['notes', 'links']);
        }
        $hidden = [];
        foreach ($hiddenRequested as $widget) {
            if (is_string($widget) && in_array($widget, self::WIDGETS, true) && !in_array($widget, $hidden, true)) {
                $hidden[] = $widget;
            }
        }

        $submittedSizes = is_array($data['sizes'] ?? null) ? $data['sizes'] : [];
        $sizes = [];
        foreach (self::DEFAULT_SIZES as $widget => $default) {
            $candidate = $submittedSizes[$widget] ?? $default;
            $candidate = is_numeric($candidate) ? (int)$candidate : 0;
            $sizes[$widget] = $candidate >= self::MIN_SIZE && $candidate <= self::MAX_SIZE ? $candidate : $default;
        }

        $heights = [];
        $submittedHeights = is_array($data['heights'] ?? null) ? $data['heights'] : [];
        foreach (self::WIDGETS as $widget) {
            $candidate = $submittedHeights[$widget] ?? 0;
            $candidate = is_numeric($candidate) ? (int)$candidate : -1;
            $validHeight = $candidate >= self::MIN_HEIGHT && $candidate <= self::MAX_HEIGHT && ($candidate - self::MIN_HEIGHT) % self::HEIGHT_STEP === 0;
            $heights[$widget] = $validHeight ? $candidate : 0;
        }

        $positions = [];
        $submittedPositions = is_array($data['positions'] ?? null) ? $data['positions'] : [];
        foreach (self::WIDGETS as $widget) {
            $position = $submittedPositions[$widget] ?? null;
            if (!is_array($position)) {
                continue;
            }
            $row = $position['row'] ?? null;
            $column = $position['column'] ?? null;
            if ((!is_int($row) && !is_string($row)) || (!is_int($column) && !is_string($column))) {
                continue;
            }
            $row = filter_var($row, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => self::MAX_WIDGET_ROW]]);
            $column = filter_var($column, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 12]]);
            if ($row !== false && $column !== false) {
                $positions[$widget] = ['row' => $row, 'column' => $column];
                $offset = $position['offset'] ?? 0;
                if (is_int($offset) || is_string($offset)) {
                    $offset = filter_var($offset, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 21]]);
                    if ($offset !== false) {
                        $positions[$widget]['offset'] = $offset;
                    }
                }
            }
        }

        $links = [];
        $requestedLinks = is_array($data['links'] ?? null) ? $data['links'] : [];
        foreach (array_slice($requestedLinks, 0, 12) as $link) {
            if (!is_array($link) || !is_string($link['title'] ?? null) || !is_string($link['url'] ?? null)) {
                continue;
            }
            $title = trim($link['title']);
            $url = trim($link['url']);
            if ($title === '' || strlen($title) > 80 || strlen($url) > 600 || !$this->validUrl($url)) {
                continue;
            }
            $links[] = ['title' => $title, 'url' => $url];
        }

        $notes = is_string($data['notes'] ?? null) ? trim($data['notes']) : '';
        if (strlen($notes) > 3000) {
            $notes = substr($notes, 0, 3000);
            while ($notes !== '' && preg_match('//u', $notes) !== 1) {
                $notes = substr($notes, 0, -1);
            }
        }

        $pins = [];
        $requestedPins = is_array($data['pins'] ?? null) ? $data['pins'] : [];
        foreach (array_slice($requestedPins, 0, 12) as $pin) {
            if (!is_string($pin) || strlen($pin) > 1024 || $pin === '/' || !str_starts_with($pin, '/')
                || str_contains($pin, '\\') || preg_match('/[\x00-\x1f\x7f]/', $pin) === 1) {
                continue;
            }
            $parts = explode('/', trim($pin, '/'));
            if (in_array('', $parts, true) || in_array('.', $parts, true) || in_array('..', $parts, true)) {
                continue;
            }
            if (!in_array($pin, $pins, true)) {
                $pins[] = $pin;
            }
        }

        $topApps = [];
        $requestedTopApps = is_array($data['topApps'] ?? null) ? $data['topApps'] : ['files', 'calendar', 'tasks', 'talk'];
        foreach (array_slice($requestedTopApps, 0, 8) as $id) {
            if (!is_string($id) || strlen($id) > 64 || preg_match('/[^a-z0-9_\-]/i', $id) === 1) {
                continue;
            }
            if (!in_array($id, $topApps, true)) {
                $topApps[] = $id;
            }
        }
        if ($topApps === []) {
            $topApps = ['files', 'calendar', 'tasks', 'talk'];
        }

        // Per-user ordering of workspaces, normalized against a fixed allowlist.
        // Append any missing tabs to preserve upgrades, with no duplicated IDs.
        $tabOrder = [];
        $requestedTabOrder = is_array($data['tabOrder'] ?? null) ? $data['tabOrder'] : [];
        foreach (array_slice($requestedTabOrder, 0, count(self::TABS)) as $id) {
            if (is_string($id) && in_array($id, self::TABS, true) && !in_array($id, $tabOrder, true)) {
                $tabOrder[] = $id;
            }
        }
        foreach (self::TABS as $id) {
            if (!in_array($id, $tabOrder, true)) {
                $tabOrder[] = $id;
            }
        }

        return compact('theme', 'density', 'accent', 'layout', 'motion', 'order', 'hidden', 'sizes', 'heights', 'positions', 'links', 'notes', 'pins', 'topApps', 'tabOrder', 'launcherMode', 'gridMode');
    }

    private function validUrl(string $url): bool {
        if (str_starts_with($url, '/') && !str_starts_with($url, '//')
            && !str_contains($url, '\\') && preg_match('/[\x00-\x1f]/', $url) !== 1) {
            return true;
        }
        if (filter_var($url, FILTER_VALIDATE_URL) === false) {
            return false;
        }
        $scheme = strtolower((string)parse_url($url, PHP_URL_SCHEME));
        return in_array($scheme, ['http', 'https'], true);
    }
}
