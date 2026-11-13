<?php

declare(strict_types=1);

namespace OCA\NovaDashboard\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IRequest;
use OCP\IURLGenerator;
use OCP\Util;

final class PageController extends Controller {
    public function __construct(
        IRequest $request,
        private IURLGenerator $url,
    ) {
        parent::__construct('novadashboard', $request);
    }

    #[NoAdminRequired]
    #[NoCSRFRequired] // Only for the initial HTML page; login remains required.
    public function index(): TemplateResponse {
        Util::addScript('novadashboard', 'app');
        Util::addStyle('novadashboard', 'app');

        return new TemplateResponse('novadashboard', 'main', [
            'webroot' => $this->url->getWebroot(),
            'overviewUrl' => $this->url->linkToRoute('novadashboard.data.overview'),
            'settingsUrl' => $this->url->linkToRoute('novadashboard.data.saveSettings'),
            'filesUrl' => $this->url->linkToRoute('novadashboard.data.browseFiles'),
            'searchUrl' => $this->url->linkToRoute('novadashboard.data.searchFiles'),
            'galleryUrl' => $this->url->linkToRoute('novadashboard.data.gallery'),
            'inlinePdfUrl' => $this->url->linkToRoute('novadashboard.data.inlinePdf'),
            'localNotesUrl' => $this->url->linkToRoute('novadashboard.data.localNotes'),
            'createLocalNoteUrl' => $this->url->linkToRoute('novadashboard.data.createLocalNote'),
            'saveLocalNoteUrl' => $this->url->linkToRoute('novadashboard.data.saveLocalNote'),
            'previewBase' => $this->url->getWebroot() . '/index.php/core/preview',
            'assetBase' => dirname($this->url->linkTo('novadashboard', 'img/neos-mark.svg')) . '/',
        ]);
    }
}
