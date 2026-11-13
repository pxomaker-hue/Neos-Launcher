<?php

declare(strict_types=1);

return [
    'routes' => [
        ['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
        ['name' => 'data#overview', 'url' => '/api/overview', 'verb' => 'GET'],
        ['name' => 'data#browseFiles', 'url' => '/api/files', 'verb' => 'GET'],
        ['name' => 'data#searchFiles', 'url' => '/api/search', 'verb' => 'GET'],
        ['name' => 'data#gallery', 'url' => '/api/gallery', 'verb' => 'GET'],
        ['name' => 'data#inlinePdf', 'url' => '/api/inline-pdf', 'verb' => 'GET'],
        ['name' => 'data#localNotes', 'url' => '/api/notes-local', 'verb' => 'GET'],
        ['name' => 'data#createLocalNote', 'url' => '/api/notes-local/create', 'verb' => 'POST'],
        ['name' => 'data#saveLocalNote', 'url' => '/api/notes-local/save', 'verb' => 'POST'],
        ['name' => 'data#saveSettings', 'url' => '/api/settings', 'verb' => 'POST'],
    ],
];
