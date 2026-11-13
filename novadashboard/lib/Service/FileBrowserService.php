<?php

declare(strict_types=1);

namespace OCA\NovaDashboard\Service;

use InvalidArgumentException;
use OCP\Constants;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Files\IRootFolder;
use OCP\IURLGenerator;
use OCP\IUser;

/**
 * Read-only directory explorer for Neos. It returns only the logged-in user's
 * accessible files, with extra metadata for in-dashboard previews.
 */
final class FileBrowserService {
    private const DISPLAY_LIMIT = 160;

    public function __construct(
        private IRootFolder $root,
        private IURLGenerator $url,
    ) {}

    public function browse(IUser $user, string $path, int $offset = 0, bool $foldersOnly = false): array {
        $path = self::validatePath($path);
        $home = $this->root->getUserFolder($user->getUID());
        $target = $path === '/' ? $home : $home->get(ltrim($path, '/'));
        if (!($target instanceof Folder)) {
            throw new InvalidArgumentException('Ce chemin ne désigne pas un dossier.');
        }
        if (($target->getPermissions() & Constants::PERMISSION_READ) === 0) {
            throw new \OCP\Files\NotPermittedException('Accès au dossier refusé');
        }

        $nodes = $target->getDirectoryListing();
        $nodes = array_values(array_filter($nodes, static fn($node): bool =>
            ($node instanceof Folder || (!$foldersOnly && $node instanceof File))
            && (($node->getPermissions() & Constants::PERMISSION_READ) !== 0)
        ));
        usort($nodes, static function ($a, $b): int {
            if (($a instanceof Folder) !== ($b instanceof Folder)) {
                return $a instanceof Folder ? -1 : 1;
            }
            return strnatcasecmp($a->getName(), $b->getName()) ?: strcmp($a->getName(), $b->getName());
        });

        $filesBase = $this->url->getWebroot() . '/index.php/apps/files/';
        $webroot = $this->url->getWebroot();
        $uid = $user->getUID();
        $entries = [];
        $total = count($nodes);
        foreach (array_slice($nodes, $offset, self::DISPLAY_LIMIT) as $node) {
            $isFolder = $node instanceof Folder;
            $name = $node->getName();
            $itemPath = rtrim($path, '/') . '/' . $name;
            $itemPath = $itemPath === '' ? '/' : $itemPath;
            $davUrl = $webroot . '/remote.php/dav/files/' . rawurlencode($uid) . '/' . $this->encodeDavPath($itemPath);
            $previewUrl = null;
            $mime = $isFolder ? 'httpd/unix-directory' : $node->getMimetype();
            if (!$isFolder) {
                $previewUrl = $webroot . '/index.php/core/preview?fileId=' . (int)$node->getId() . '&x=1400&y=1000&a=1';
            }
            $entries[] = [
                'id' => (int)$node->getId(),
                'permissions' => (int)$node->getPermissions(),
                'name' => $name,
                'path' => $itemPath,
                'kind' => $isFolder ? 'folder' : 'file',
                'mtime' => (int)$node->getMTime(),
                'size' => $isFolder ? null : (int)$node->getSize(),
                'mime' => $mime,
                'ext' => strtolower(pathinfo($name, PATHINFO_EXTENSION)),
                'url' => $filesBase . '?dir=' . rawurlencode($path) . '&scrollto=' . rawurlencode($name),
                'davUrl' => $davUrl,
                'previewUrl' => $previewUrl,
            ];
        }

        return [
            'path' => $path,
            'canCreate' => (($target->getPermissions() & Constants::PERMISSION_CREATE) !== 0),
            'davUrl' => $webroot . '/remote.php/dav/files/' . rawurlencode($uid) . ($path === '/' ? '' : '/' . $this->encodeDavPath($path)),
            'items' => $entries,
            'total' => $total,
            'truncated' => $total > $offset + count($entries),
            'nextOffset' => $total > $offset + count($entries) ? $offset + count($entries) : null,
            'limit' => self::DISPLAY_LIMIT,
            'filesUrl' => $filesBase . '?dir=' . rawurlencode($path),
        ];
    }

    /** Returns an authenticated, readable PDF node in the current user's files. */
    public function pdfFile(IUser $user, string $path): File {
        $path = self::validatePath($path);
        if ($path === '/') {
            throw new InvalidArgumentException('Un PDF doit être sélectionné.');
        }
        $home = $this->root->getUserFolder($user->getUID());
        $file = $home->get(ltrim($path, '/'));
        if (!($file instanceof File)) {
            throw new InvalidArgumentException('Ce chemin ne désigne pas un fichier.');
        }
        if (($file->getPermissions() & Constants::PERMISSION_READ) === 0) {
            throw new \OCP\Files\NotPermittedException('Lecture refusée');
        }
        $pdfName = str_ends_with(strtolower($file->getName()), '.pdf');
        if (strtolower($file->getMimetype()) !== 'application/pdf' && !$pdfName) {
            throw new InvalidArgumentException('Le fichier sélectionné n’est pas un PDF.');
        }
        return $file;
    }

    public static function validatePath(string $path): string {
        if ($path === '') {
            return '/';
        }
        if (!str_starts_with($path, '/') || strlen($path) > 1024
            || str_contains($path, '\\') || preg_match('/[\x00-\x1f\x7f]/', $path) === 1) {
            throw new InvalidArgumentException('Chemin invalide.');
        }
        if ($path === '/') {
            return '/';
        }
        $parts = explode('/', trim($path, '/'));
        foreach ($parts as $part) {
            if ($part === '' || $part === '.' || $part === '..') {
                throw new InvalidArgumentException('Chemin invalide.');
            }
        }
        return '/' . implode('/', $parts);
    }

    private function encodeDavPath(string $path): string {
        $parts = array_filter(explode('/', trim($path, '/')), static fn(string $part): bool => $part !== '');
        return implode('/', array_map('rawurlencode', $parts));
    }
}
