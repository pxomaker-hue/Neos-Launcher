<?php

declare(strict_types=1);

namespace OCA\NovaDashboard\Service;

use InvalidArgumentException;
use OCP\Constants;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Files\IRootFolder;
use OCP\Files\NotFoundException;
use OCP\Files\NotPermittedException;
use OCP\IConfig;
use OCP\IUser;

/**
 * Optional, per-user, Nextcloud-files-backed Notes fallback.
 * Used only when the Notes app REST endpoint is missing (404).
 * Reads and writes via Nextcloud's storage abstraction (never raw NAS paths).
 */
final class LocalNotesService {
    private const LIMIT = 50;
    private const MAX_SIZE = 1048576; // 1 MiB, protects response size and editor

    public function __construct(
        private IRootFolder $root,
        private IConfig $config,
    ) {}

    public function list(IUser $user, int $offset = 0): array {
        $folder = $this->getNotesFolder($user, false);
        if ($folder === null) {
            return ['items' => [], 'source' => 'files', 'folder' => $this->relativeFolder(), 'nextOffset' => null];
        }
        if (($folder->getPermissions() & Constants::PERMISSION_READ) === 0) {
            throw new NotPermittedException('Lecture du dossier Notes refusée');
        }
        $items = [];
        foreach ($folder->getDirectoryListing() as $node) {
            if (!($node instanceof File) || !$this->isNote($node) || $node->getSize() > self::MAX_SIZE) {
                continue;
            }
            if (($node->getPermissions() & Constants::PERMISSION_READ) === 0) {
                continue;
            }
            $items[] = $node;
        }
        usort($items, static fn(File $a, File $b): int => ($b->getMTime() <=> $a->getMTime()) ?: ($a->getId() <=> $b->getId()));
        $selected = [];
        $budget = 8 * 1024 * 1024;
        $next = $offset;
        foreach (array_slice($items, $offset, self::LIMIT) as $file) {
            $size = max(0, (int)$file->getSize());
            if ($size > $budget) {
                break;
            }
            $selected[] = $this->serialize($file);
            $budget -= $size;
            $next++;
        }
        return [
            'items' => $selected,
            'source' => 'files',
            'folder' => $this->relativeFolder(),
            'nextOffset' => $next < count($items) ? $next : null,
        ];
    }

    public function create(IUser $user, string $title, string $content): array {
        $folder = $this->getNotesFolder($user, true);
        if (($folder->getPermissions() & Constants::PERMISSION_CREATE) === 0) {
            throw new NotPermittedException('Création de note refusée');
        }
        $name = $this->safeName($title);
        $this->validateContent($content);
        $candidate = $name . '.md';
        $count = 2;
        while ($folder->nodeExists($candidate)) {
            $candidate = $name . ' (' . $count . ').md';
            if (++$count > 100) {
                throw new InvalidArgumentException('Trop de notes portent ce nom.');
            }
        }
        return $this->serialize($folder->newFile($candidate, $content));
    }

    public function save(IUser $user, int $id, string $title, string $content, string $etag): array {
        $this->validateContent($content);
        $folder = $this->getNotesFolder($user, false);
        if ($folder === null) {
            throw new NotFoundException('Dossier Notes introuvable');
        }
        $file = $this->find($folder, $id);
        if (($file->getPermissions() & Constants::PERMISSION_UPDATE) === 0) {
            throw new NotPermittedException('Modification de note refusée');
        }
        if ($etag !== '' && $etag !== $file->getEtag()) {
            throw new \RuntimeException('CONFLICT_ETAG');
        }
        $filename = $this->safeName($title) . '.' . strtolower(pathinfo($file->getName(), PATHINFO_EXTENSION));
        if ($filename !== $file->getName()) {
            if (($folder->getPermissions() & Constants::PERMISSION_CREATE) === 0 || !$file->isDeletable()) {
                throw new NotPermittedException('Renommage de note refusé');
            }
            if ($folder->nodeExists($filename)) {
                throw new InvalidArgumentException('Une note porte déjà ce titre.');
            }
            $file = $file->move(rtrim($folder->getPath(), '/') . '/' . $filename);
        }
        $file->putContent($content);
        return $this->serialize($file);
    }

    private function find(Folder $folder, int $id): File {
        foreach ($folder->getDirectoryListing() as $node) {
            if ($node instanceof File && (int)$node->getId() === $id && $this->isNote($node)) {
                return $node;
            }
        }
        throw new NotFoundException('Note introuvable');
    }

    private function getNotesFolder(IUser $user, bool $create): ?Folder {
        $home = $this->root->getUserFolder($user->getUID());
        $parts = explode('/', $this->relativeFolder());
        $current = $home;
        foreach ($parts as $part) {
            if (!$current->nodeExists($part)) {
                if (!$create) {
                    return null;
                }
                if (($current->getPermissions() & Constants::PERMISSION_CREATE) === 0) {
                    throw new NotPermittedException('Création de dossier refusée');
                }
                $current = $current->newFolder($part);
                continue;
            }
            $node = $current->get($part);
            if (!($node instanceof Folder)) {
                throw new InvalidArgumentException('Le dossier Notes est occupé par un fichier.');
            }
            $current = $node;
        }
        return $current;
    }

    private function relativeFolder(): string {
        $configured = trim((string)$this->config->getAppValue('notes', 'defaultFolder', 'Notes'), '/');
        if ($configured === '') {
            return 'Notes';
        }
        try {
            return ltrim(FileBrowserService::validatePath('/' . $configured), '/');
        } catch (InvalidArgumentException $exception) {
            return 'Notes';
        }
    }

    private function isNote(File $file): bool {
        return in_array(strtolower(pathinfo($file->getName(), PATHINFO_EXTENSION)), ['md', 'txt'], true);
    }

    private function safeName(string $title): string {
        $name = trim(preg_replace('/[\x00-\x1f\x7f\\\\\/:*?"<>|]/u', ' ', $title) ?? '');
        $name = trim($name, ". \t\r\n");
        if ($name === '' || $name === '.' || $name === '..' || mb_strlen($name) > 150) {
            throw new InvalidArgumentException('Titre de note invalide (150 caractères maximum).');
        }
        return $name;
    }

    private function validateContent(string $content): void {
        if (strlen($content) > self::MAX_SIZE) {
            throw new InvalidArgumentException('La note dépasse 1 Mo.');
        }
    }

    private function serialize(File $file): array {
        return [
            'id' => $file->getId(),
            'title' => pathinfo($file->getName(), PATHINFO_FILENAME),
            'content' => $file->getContent(),
            'category' => 'Fichiers Nextcloud',
            'modified' => $file->getMTime(),
            'etag' => $file->getEtag(),
            'readonly' => ($file->getPermissions() & Constants::PERMISSION_UPDATE) === 0,
        ];
    }
}
