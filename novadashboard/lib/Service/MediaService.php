<?php

declare(strict_types=1);

namespace OCA\NovaDashboard\Service;

use OCP\Constants;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Files\IRootFolder;
use OCP\IURLGenerator;
use OCP\IUser;
use Throwable;

/**
 * Bounded, read-only image discovery using Nextcloud's existing permissions.
 * Not a replacement for the Photos app's album/indexing functionality.
 */
final class MediaService {
    private const MAX_SCANNED = 900;
    private const MAX_DEPTH = 6;
    private const MAX_IMAGES = 120;

    public function __construct(private IRootFolder $root, private IURLGenerator $url) {}

    public function gallery(IUser $user): array {
        $uid = $user->getUID();
        $home = $this->root->getUserFolder($uid);
        $queue = [[$home, 0]];
        $scanned = 0;
        $images = [];
        $webroot = $this->url->getWebroot();
        while ($queue !== [] && $scanned < self::MAX_SCANNED) {
            [$folder, $depth] = array_shift($queue);
            try {
                $nodes = $folder->getDirectoryListing();
            } catch (Throwable $e) { continue; }
            usort($nodes, static fn($a, $b): int => $b->getMTime() <=> $a->getMTime());
            foreach ($nodes as $node) {
                if (++$scanned > self::MAX_SCANNED) { break; }
                if (($node->getPermissions() & Constants::PERMISSION_READ) === 0) { continue; }
                if ($node instanceof Folder) {
                    if ($depth < self::MAX_DEPTH) { $queue[] = [$node, $depth + 1]; }
                    continue;
                }
                if (!$node instanceof File || !str_starts_with($node->getMimetype(), 'image/')) { continue; }
                $relative = $home->getRelativePath($node->getPath());
                if (!is_string($relative) || $relative === '') { continue; }
                $parent = dirname($relative);
                $parent = $parent === '.' ? '/' : '/' . trim($parent, '/');
                $images[] = [
                    'id' => $node->getId(),
                    'name' => $node->getName(),
                    'mime' => $node->getMimetype(),
                    'mtime' => $node->getMTime(),
                    'size' => $node->getSize(),
                    'folder' => $parent,
                    'previewUrl' => $webroot . '/index.php/core/preview?fileId=' . (int)$node->getId() . '&x=1200&y=900&a=1',
                    'davUrl' => $webroot . '/remote.php/dav/files/' . rawurlencode($uid) . '/' . implode('/', array_map('rawurlencode', explode('/', $relative))),
                    'url' => $webroot . '/index.php/apps/files/?dir=' . rawurlencode($parent) . '&scrollto=' . rawurlencode($node->getName()),
                ];
                if (count($images) > self::MAX_IMAGES * 3) {
                    usort($images, static fn($a, $b): int => $b['mtime'] <=> $a['mtime']);
                    $images = array_slice($images, 0, self::MAX_IMAGES);
                }
            }
        }
        usort($images, static fn($a, $b): int => $b['mtime'] <=> $a['mtime']);
        return ['items' => array_slice($images, 0, self::MAX_IMAGES), 'scanned' => $scanned,
            'partial' => $scanned >= self::MAX_SCANNED, 'limit' => self::MAX_IMAGES];
    }
}
