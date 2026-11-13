<?php

declare(strict_types=1);

namespace OCA\NovaDashboard\Controller;

use OCA\NovaDashboard\Service\OverviewService;
use OCA\NovaDashboard\Service\PreferencesService;
use OCA\NovaDashboard\Service\FileBrowserService;
use OCA\NovaDashboard\Service\FileSearchService;
use OCA\NovaDashboard\Service\MediaService;
use OCA\NovaDashboard\Service\LocalNotesService;
use OCP\Files\NotFoundException;
use OCP\Files\NotPermittedException;
use InvalidArgumentException;
use Throwable;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\ContentSecurityPolicy;
use OCP\AppFramework\Http\FileDisplayResponse;
use OCP\AppFramework\Http\Response;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;
use OCP\IUserSession;

final class DataController extends Controller {
    public function __construct(
        IRequest $request,
        private IUserSession $session,
        private OverviewService $overviewService,
        private PreferencesService $preferences,
        private FileBrowserService $fileBrowser,
        private FileSearchService $fileSearch,
        private MediaService $media,
        private LocalNotesService $localNotes,
    ) {
        parent::__construct('novadashboard', $request);
    }

    #[NoAdminRequired]
    public function overview(): JSONResponse {
        $user = $this->session->getUser();
        if ($user === null) {
            return new JSONResponse(['error' => 'Authentification requise'], 401);
        }
        $response = new JSONResponse([
            'user' => ['name' => $user->getDisplayName(), 'uid' => $user->getUID()],
            'overview' => $this->overviewService->build($user),
            'settings' => $this->preferences->get($user->getUID()),
        ]);
        $response->addHeader('Cache-Control', 'private, no-store');
        return $response;
    }

    #[NoAdminRequired]
    public function browseFiles(): JSONResponse {
        $user = $this->session->getUser();
        if ($user === null) {
            return new JSONResponse(['error' => 'Authentification requise'], 401);
        }
        $path = $this->request->getParam('path', '/');
        if (!is_string($path)) {
            return new JSONResponse(['error' => 'Chemin invalide'], 400);
        }
        try {
            $offset = filter_var($this->request->getParam('offset', 0), FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
            if ($offset === false) {
                return new JSONResponse(['error' => 'Position invalide'], 400);
            }
            $foldersOnly = $this->request->getParam('foldersOnly', '0') === '1';
            $result = $this->fileBrowser->browse($user, $path, $offset, $foldersOnly);
            $response = new JSONResponse($result);
        } catch (InvalidArgumentException $error) {
            return new JSONResponse(['error' => 'Chemin invalide'], 400);
        } catch (NotFoundException $error) {
            return new JSONResponse(['error' => 'Dossier introuvable'], 404);
        } catch (NotPermittedException $error) {
            return new JSONResponse(['error' => 'Accès au dossier refusé'], 403);
        } catch (Throwable $error) {
            return new JSONResponse(['error' => 'Impossible de lire ce dossier'], 500);
        }
        $response->addHeader('Cache-Control', 'private, no-store');
        return $response;
    }

    #[NoAdminRequired]
    public function searchFiles(): JSONResponse {
        $user = $this->session->getUser();
        if ($user === null) {
            return new JSONResponse(['error' => 'Authentification requise'], 401);
        }
        $query = $this->request->getParam('q', '');
        if (!is_string($query)) {
            return new JSONResponse(['error' => 'Recherche invalide'], 400);
        }
        try {
            $filters = [];
            foreach (['type', 'date', 'size', 'sort'] as $filter) {
                $value = $this->request->getParam($filter, $filter === 'sort' ? 'recent' : 'all');
                if (!is_string($value)) {
                    return new JSONResponse(['error' => 'Filtre de recherche invalide'], 400);
                }
                $filters[$filter] = $value;
            }
            $offset = filter_var($this->request->getParam('offset', 0), FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
            if ($offset === false) {
                return new JSONResponse(['error' => 'Position invalide'], 400);
            }
            $response = new JSONResponse($this->fileSearch->search($user, $query, $filters['type'], $filters['date'], $filters['size'], $filters['sort'], $offset));
            $response->addHeader('Cache-Control', 'private, no-store');
            return $response;
        } catch (InvalidArgumentException $error) {
            return new JSONResponse(['error' => $error->getMessage()], 400);
        } catch (Throwable $error) {
            return new JSONResponse(['error' => 'Recherche momentanément indisponible'], 500);
        }
    }

    #[NoAdminRequired]
    public function gallery(): JSONResponse {
        $user = $this->session->getUser();
        if ($user === null) {
            return new JSONResponse(['error' => 'Authentification requise'], 401);
        }
        try {
            $result = new JSONResponse($this->media->gallery($user));
            $result->addHeader('Cache-Control', 'private, no-store');
            return $result;
        } catch (Throwable $error) {
            return new JSONResponse(['error' => 'Photos momentanément indisponibles'], 500);
        }
    }

    /**
     * Inline PDF preview. A file URL from WebDAV may force Content-Disposition:
     * attachment and trigger a download when used inside an iframe.
     * This route is read-only, authenticated and verifies user file permissions.
     */
    #[NoAdminRequired]
    #[NoCSRFRequired]
    public function inlinePdf(): Response {
        $user = $this->session->getUser();
        if ($user === null) {
            return new JSONResponse(['error' => 'Authentification requise'], 401);
        }
        $path = $this->request->getParam('path', '');
        if (!is_string($path)) {
            return new JSONResponse(['error' => 'Chemin invalide'], 400);
        }
        try {
            $file = $this->fileBrowser->pdfFile($user, $path);
            $response = new FileDisplayResponse($file);
            // This authenticated route only serves PDF bytes. Permit embedding
            // solely from the same origin (Neos); do not relax the global CSP.
            $response->setContentSecurityPolicy(new ContentSecurityPolicy());
            $response->addHeader('Content-Type', 'application/pdf');
            $response->addHeader('Content-Disposition', 'inline; filename="document.pdf"');
            $response->addHeader('X-Content-Type-Options', 'nosniff');
            $response->addHeader('Cache-Control', 'private, no-store');
            return $response;
        } catch (InvalidArgumentException $error) {
            return new JSONResponse(['error' => 'Chemin PDF invalide'], 400);
        } catch (NotFoundException $error) {
            return new JSONResponse(['error' => 'PDF introuvable'], 404);
        } catch (NotPermittedException $error) {
            return new JSONResponse(['error' => 'Accès refusé'], 403);
        } catch (Throwable $error) {
            return new JSONResponse(['error' => 'Aperçu PDF indisponible'], 500);
        }
    }

    /** File-backed notes fallback when Notes REST API is not installed. */
    #[NoAdminRequired]
    public function localNotes(): JSONResponse {
        $user = $this->session->getUser();
        if ($user === null) {
            return new JSONResponse(['error' => 'Authentification requise'], 401);
        }
        try {
            $offset = filter_var($this->request->getParam('offset', 0), FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
            if ($offset === false) {
                return new JSONResponse(['error' => 'Position invalide'], 400);
            }
            $response = new JSONResponse($this->localNotes->list($user, $offset));
            $response->addHeader('Cache-Control', 'private, no-store');
            return $response;
        } catch (NotPermittedException $error) {
            return new JSONResponse(['error' => 'Dossier Notes inaccessible'], 403);
        } catch (Throwable $error) {
            return new JSONResponse(['error' => 'Notes indisponibles'], 500);
        }
    }

    #[NoAdminRequired]
    public function createLocalNote(): JSONResponse {
        $user = $this->session->getUser();
        if ($user === null) {
            return new JSONResponse(['error' => 'Authentification requise'], 401);
        }
        $title = $this->request->getParam('title', '');
        $content = $this->request->getParam('content', '');
        if (!is_string($title) || !is_string($content)) {
            return new JSONResponse(['error' => 'Note invalide'], 400);
        }
        try {
            return new JSONResponse($this->localNotes->create($user, $title, $content), 201);
        } catch (InvalidArgumentException $error) {
            return new JSONResponse(['error' => $error->getMessage()], 400);
        } catch (NotPermittedException $error) {
            return new JSONResponse(['error' => 'Écriture interdite'], 403);
        } catch (Throwable $error) {
            return new JSONResponse(['error' => 'Création de note impossible'], 500);
        }
    }

    #[NoAdminRequired]
    public function saveLocalNote(): JSONResponse {
        $user = $this->session->getUser();
        if ($user === null) {
            return new JSONResponse(['error' => 'Authentification requise'], 401);
        }
        $id = $this->request->getParam('id', 0);
        $title = $this->request->getParam('title', '');
        $content = $this->request->getParam('content', '');
        $etag = $this->request->getParam('etag', '');
        if ((!is_int($id) && !(is_string($id) && ctype_digit($id))) || (int)$id <= 0
            || !is_string($title) || !is_string($content) || !is_string($etag)) {
            return new JSONResponse(['error' => 'Note invalide'], 400);
        }
        try {
            return new JSONResponse($this->localNotes->save($user, (int)$id, $title, $content, $etag));
        } catch (InvalidArgumentException $error) {
            return new JSONResponse(['error' => $error->getMessage()], 400);
        } catch (NotFoundException $error) {
            return new JSONResponse(['error' => 'Note introuvable'], 404);
        } catch (NotPermittedException $error) {
            return new JSONResponse(['error' => 'Écriture interdite'], 403);
        } catch (\RuntimeException $error) {
            if ($error->getMessage() === 'CONFLICT_ETAG') {
                return new JSONResponse(['error' => 'La note a été modifiée ailleurs'], 412);
            }
            return new JSONResponse(['error' => 'Erreur de note'], 500);
        } catch (Throwable $error) {
            return new JSONResponse(['error' => 'Enregistrement impossible'], 500);
        }
    }

    #[NoAdminRequired]
    public function saveSettings(): JSONResponse {
        $user = $this->session->getUser();
        if ($user === null) {
            return new JSONResponse(['error' => 'Authentification requise'], 401);
        }

        // The route is intentionally not CSRF-exempt; Nextcloud verifies requesttoken.
        $settings = $this->request->getParam('settings');
        if (!is_array($settings)) {
            return new JSONResponse(['error' => 'Préférences invalides'], 400);
        }
        $value = $this->preferences->save($user->getUID(), $settings);
        $response = new JSONResponse(['settings' => $value]);
        $response->addHeader('Cache-Control', 'private, no-store');
        return $response;
    }
}
