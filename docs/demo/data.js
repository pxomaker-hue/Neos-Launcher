// Données fictives pour la démonstration hors ligne.
window.NOVA_DEMO_DATA = {
  "overview": {
    "user": {
      "name": "Démo"
    },
    "settings": {
      "theme": "dark",
      "density": "comfortable",
      "accent": "cyan",
      "layout": "wide",
      "motion": "off",
      "launcherMode": "topbar",
      "order": [
        "summary",
        "storage",
        "clock",
        "tasks",
        "calendar",
        "explorer",
        "files",
        "deck",
        "shortcuts",
        "links",
        "notes"
      ],
      "hidden": [
        "links",
        "notes"
      ],
      "sizes": {
        "explorer": 12,
        "storage": 3,
        "shortcuts": 6,
        "clock": 3,
        "files": 6,
        "calendar": 6,
        "tasks": 6,
        "summary": 6,
        "links": 6,
        "notes": 6
      },
      "links": [],
      "notes": "",
      "pins": [],
      "topApps": [
        "photos",
        "calendar",
        "tasks",
        "talk",
        "deck",
        "notes"
      ],
      "gridMode": "adaptive"
    },
    "overview": {
      "storage": {
        "used": 405600000,
        "total": 2147483648,
        "percent": 18.9,
        "volume": {
          "total": 2199023255552,
          "free": 1429365116108,
          "used": 769658139443,
          "percent": 35,
          "label": "Volume contenant les données Nextcloud",
          "note": "Capacité du système de fichiers, pas capacité brute des disques NAS"
        }
      },
      "files": [
        {
          "name": "maquette-neos.png",
          "folder": "Photos",
          "mtime": 1794300000,
          "size": 245000,
          "url": "#",
          "davUrl": "/remote.php/dav/files/demo/foo.jpg",
          "mime": "image/png"
        },
        {
          "name": "Document texte.md",
          "folder": "/",
          "mtime": 1794299500,
          "size": 122,
          "url": "#",
          "davUrl": "/remote.php/dav/files/demo/foo.md",
          "mime": "text/markdown"
        }
      ],
      "calendar": [
        {
          "title": "Réunion projet NEOS",
          "start": "2026-11-10T10:00:00+01:00",
          "calendar": "Personnel",
          "color": "#22DDD6"
        },
        {
          "title": "Revue sprint",
          "start": "2026-11-11T14:00:00+01:00",
          "calendar": "Travail",
          "color": "#A987FA"
        }
      ],
      "tasks": [
        {
          "title": "Finaliser le dashboard",
          "due": "2026-11-12T12:00:00+01:00"
        }
      ],
      "shortcuts": [
        {
          "id": "files",
          "label": "Fichiers",
          "icon": "folder",
          "url": "#"
        },
        {
          "id": "photos",
          "label": "Photos",
          "icon": "image",
          "url": "#"
        },
        {
          "id": "calendar",
          "label": "Agenda",
          "icon": "calendar",
          "url": "#"
        },
        {
          "id": "tasks",
          "label": "Tâches",
          "icon": "check",
          "url": "#"
        },
        {
          "id": "talk",
          "label": "Talk",
          "icon": "message",
          "url": "#"
        },
        {
          "id": "contacts",
          "label": "Contacts",
          "icon": "users",
          "url": "#"
        },
        {
          "id": "mail",
          "label": "Mail",
          "icon": "mail",
          "url": "#"
        },
        {
          "id": "activity",
          "label": "Activité",
          "icon": "bolt",
          "url": "#"
        },
        {
          "id": "deck",
          "label": "Deck",
          "icon": "kanban",
          "url": "#"
        },
        {
          "id": "notes",
          "label": "Notes",
          "icon": "note",
          "url": "#"
        }
      ],
      "warnings": []
    }
  },
  "browse": {
    "/": {
      "path": "/",
      "davUrl": "/remote.php/dav/files/demo",
      "items": [
        {
          "name": "Projets",
          "kind": "folder",
          "path": "/Projets",
          "size": 0,
          "mime": "httpd/unix-directory",
          "mtime": 1794300000,
          "url": "#",
          "davUrl": "/remote.php/dav/files/demo/Projets",
          "previewUrl": "./novadashboard/img/demo/photo-1.svg"
        },
        {
          "name": "maquette-neos.png",
          "kind": "file",
          "path": "/maquette-neos.png",
          "size": 245000,
          "mime": "image/png",
          "mtime": 1794300000,
          "url": "#",
          "davUrl": "/remote.php/dav/files/demo/maquette-neos.png",
          "previewUrl": "./novadashboard/img/demo/photo-1.svg"
        },
        {
          "name": "Document texte.md",
          "kind": "file",
          "path": "/Document texte.md",
          "size": 1200,
          "mime": "text/markdown",
          "mtime": 1794300000,
          "url": "#",
          "davUrl": "/remote.php/dav/files/demo/Document texte.md",
          "previewUrl": "./novadashboard/img/demo/photo-1.svg"
        },
        {
          "name": "Budget.xlsx",
          "kind": "file",
          "path": "/Budget.xlsx",
          "size": 96530,
          "mime": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "mtime": 1794300000,
          "url": "#",
          "davUrl": "/remote.php/dav/files/demo/Budget.xlsx",
          "previewUrl": "./novadashboard/img/demo/photo-1.svg"
        },
        {
          "name": "Présentation.pptx",
          "kind": "file",
          "path": "/Présentation.pptx",
          "size": 50200,
          "mime": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "mtime": 1794300000,
          "url": "#",
          "davUrl": "/remote.php/dav/files/demo/Présentation.pptx",
          "previewUrl": "./novadashboard/img/demo/photo-1.svg"
        }
      ],
      "total": 5,
      "truncated": false,
      "filesUrl": "#"
    },
    "/Projets": {
      "path": "/Projets",
      "davUrl": "/remote.php/dav/files/demo/Projets",
      "items": [
        {
          "name": "Rapport.md",
          "kind": "file",
          "path": "/Rapport.md",
          "size": 100,
          "mime": "text/markdown",
          "mtime": 1794300000,
          "url": "#",
          "davUrl": "/remote.php/dav/files/demo/Rapport.md",
          "previewUrl": "./novadashboard/img/demo/photo-1.svg"
        },
        {
          "name": "Guide-Neos.md",
          "kind": "file",
          "path": "/Projets/Guide-Neos.md",
          "size": 109,
          "mime": "text/markdown",
          "mtime": 1794300000,
          "url": "#",
          "davUrl": "/remote.php/dav/files/demo/Projets/Guide-Neos.md",
          "previewUrl": "#"
        },
        {
          "name": "Ambiance-atelier.mp3",
          "kind": "file",
          "path": "/Projets/Ambiance-atelier.mp3",
          "size": 4096000,
          "mime": "audio/mpeg",
          "mtime": 1794300000,
          "url": "#",
          "davUrl": "/remote.php/dav/files/demo/Projets/Ambiance-atelier.mp3",
          "previewUrl": "#"
        },
        {
          "name": "Présentation-Neos.mp4",
          "kind": "file",
          "path": "/Projets/Présentation-Neos.mp4",
          "size": 9000000,
          "mime": "video/mp4",
          "mtime": 1794300000,
          "url": "#",
          "davUrl": "/remote.php/dav/files/demo/Projets/Présentation-Neos.mp4",
          "previewUrl": "#"
        }
      ],
      "total": 4,
      "truncated": false,
      "filesUrl": "#"
    }
  },
  "gallery": {
    "items": [
      {
        "id": 101,
        "name": "Photo-1.jpg",
        "mime": "image/jpeg",
        "mtime": 1794299000,
        "folder": "/Photos",
        "size": 300000,
        "previewUrl": "./novadashboard/img/demo/photo-1.svg",
        "davUrl": "/remote.php/dav/files/demo/photo-1.jpg",
        "url": "#"
      },
      {
        "id": 102,
        "name": "Photo-2.jpg",
        "mime": "image/jpeg",
        "mtime": 1794298000,
        "folder": "/Photos",
        "size": 300000,
        "previewUrl": "./novadashboard/img/demo/photo-2.svg",
        "davUrl": "/remote.php/dav/files/demo/photo-2.jpg",
        "url": "#"
      },
      {
        "id": 103,
        "name": "Photo-3.jpg",
        "mime": "image/jpeg",
        "mtime": 1794297000,
        "folder": "/Photos",
        "size": 300000,
        "previewUrl": "./novadashboard/img/demo/photo-3.svg",
        "davUrl": "/remote.php/dav/files/demo/photo-3.jpg",
        "url": "#"
      },
      {
        "id": 104,
        "name": "Photo-4.jpg",
        "mime": "image/jpeg",
        "mtime": 1794296000,
        "folder": "/Photos",
        "size": 300000,
        "previewUrl": "./novadashboard/img/demo/photo-4.svg",
        "davUrl": "/remote.php/dav/files/demo/photo-4.jpg",
        "url": "#"
      },
      {
        "id": 105,
        "name": "Photo-5.jpg",
        "mime": "image/jpeg",
        "mtime": 1794295000,
        "folder": "/Photos",
        "size": 300000,
        "previewUrl": "./novadashboard/img/demo/photo-5.svg",
        "davUrl": "/remote.php/dav/files/demo/photo-5.jpg",
        "url": "#"
      }
    ],
    "partial": false
  },
  "notes": [
    {
      "id": 1,
      "title": "Notes de conception",
      "content": "## Priorités\n\n- Navigation intégrée\n- Design flat cyber\n- Rapide et fluide",
      "etag": "demo",
      "category": "Design",
      "modified": 1794300000,
      "readonly": false
    },
    {
      "id": 2,
      "title": "Compte-rendu",
      "content": "Réunion sur les fichiers et Deck.",
      "etag": "demo",
      "category": "Projets",
      "modified": 1794213500,
      "readonly": false
    }
  ],
  "deckBoards": [
    {
      "id": 2,
      "title": "Projet Neos",
      "color": "22dddd",
      "permissions": {
        "PERMISSION_EDIT": true
      }
    },
    {
      "id": 3,
      "title": "Personnel",
      "color": "A987FA"
    }
  ],
  "deckStacks": {
    "2": [
      {
        "id": 1,
        "title": "À faire",
        "order": 0,
        "cards": [
          {
            "title": "Aperçu Office",
            "id": 1,
            "duedate": "2026-11-18T14:00:00+01:00"
          },
          {
            "title": "Actions rapides fichiers",
            "id": 2
          }
        ]
      },
      {
        "id": 2,
        "title": "En cours",
        "order": 1,
        "cards": [
          {
            "title": "Intégration des icônes",
            "id": 3,
            "duedate": "2026-11-20T12:00:00+01:00"
          }
        ]
      },
      {
        "id": 3,
        "title": "Terminé",
        "order": 2,
        "cards": [
          {
            "title": "Navigation interne",
            "id": 4
          }
        ]
      }
    ],
    "3": [
      {
        "id": 9,
        "title": "À suivre",
        "order": 0,
        "cards": [
          {
            "title": "Configuration NAS",
            "id": 10
          }
        ]
      }
    ]
  }
};
