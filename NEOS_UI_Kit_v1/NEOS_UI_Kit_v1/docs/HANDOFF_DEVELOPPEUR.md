# CAHIER DE PASSATION — NEOS Dashboard / Nextcloud

## 1. Objectif

Intégrer le thème **NEOS Cyber Flat** à l’interface dashboard actuelle, dans l’esprit de la dernière maquette. Le pack livre des composants visuels SVG et des styles prêts à adapter, sans exiger de changement de framework ni d’architecture.

## 2. Priorité de fidélité

1. Reprendre la composition de l'interface **actuelle** (captures `references/dashboard-existant.png`) et préserver son fonctionnement.
2. Utiliser `references/concept-neos.png` comme guide esthétique (non comme spécification au pixel près).
3. Adapter les assets, variables et composants CSS livrés; remplacer toutes les données simulées de la page démo par les valeurs Nextcloud réelles.
4. Éviter les grandes images bitmap pour les éléments de layout : les bannières, panneaux et bordures sont fournis en SVG afin de supporter le responsive.

## 3. Inventaire des zones à habiller

| Zone actuelle | Style cible | Fichier / classe |
|---|---|---|
| Barre NEOS / Nextcloud | Logo horizontal + recherche + actions | `assets/branding/neos-wordmark.svg`, `.neos-topbar` |
| Navigation applications | 10 icônes flat, actif cyan, pills | `.neos-nav`, `.neos-nav-item`, icônes `assets/icons/apps/` |
| Entête « Mon espace » | Bandeau dégradé et motifs cyber très légers | `heading-cyber.svg`, `.neos-hero` |
| Bloc fichiers | Panneau navy, header et toolbar, aperçu | `.neos-files-panel`, `.neos-toolbar`, `.neos-table` |
| Stockage | Carte navy, jauge turquoise > violet | `.neos-panel`, `.neos-progress` |
| Hub apps | 10 tuiles distinctes sans libellés incrustés | `.neos-app-grid`, `assets/icons/tiles/` |
| Horloge | Carte navy bordure ambre, date/heure en DOM | `.neos-panel--amber` |
| Récents, Agenda | Panneaux très lisibles | `.neos-list-row` |
| En-têtes / pieds de catégories | Décor discret et étirable | `card-heading.svg`, `card-footer.svg` |
| Arrière-plan | Fond navy au gradient très faible | `dashboard-background.svg` |

## 4. Tailles de référence

- Icônes navbar **18–22 px**, toolbar **16–20 px**.
- Icônes app en tuiles **40–48 px**, cases de **min 75–85 px**, taille ajustée selon largeur.
- Barres en-têtes **42–56 px** ; titre « Mon espace » autour de **90 px de hauteur**.
- Radius cartes **18 px**, petits contrôles **9–13 px**.
- Desktop : grille stockage / hub / horloge (**1 : 2.6 : 0.95** environ). Tablet : passer sur 2 colonnes ; mobile : empiler.
- Ne pas étirer un seul PNG d'icône en largeur ; utiliser des SVG et des éléments CSS.

## 5. Contraintes fonctionnelles

- **Ne pas recréer Nextcloud**. Le système est déjà en place, le travail consiste à réhabiller.
- Conserver les appels, routes, événements, permissions, préférences, raccourcis, filtrage, pagination, upload/download, ouverture de fichier, aperçu, données utilisateur et horloge existants.
- `demo/index.html` n'a aucune logique métier, ne pas prendre ses boutons pour des contrôles implémentés.
- Priorité au responsive et à la navigation clavier, contrastes de texte, `:focus-visible`, labels d'icônes, réductions d'animations.
- Utiliser un scope CSS local tel que `.neos-theme`, jamais `button {}` ou `.app-content {}` globaux sur Nextcloud.
- Pour les SVG via `<img>` masquer l'image aux lecteurs d'écran si l'élément a déjà son texte; pour boutons icon-only fournir `aria-label`.
- Si Vite/Webpack ou framework gère les assets, adapter les chemins relatifs sans recharger les SVG depuis des URL externes.

## 6. Variables d'identité à conserver

Fond `#07111F` · panneaux `#0C192B` · texte `#F0F6FF` · cyan `#22DDD6` · bleu `#3BC8FA` · violet `#A987FA` · menthe `#38DCAB` · rose `#EF71B2` · ambre `#F5BD57` · cuivre `#B57D57`.

Le cuivre est un **accent** ; les engrenages sont exceptionnellement décoratifs. Pas de texture métallique lourde ni de néon partout.

## 7. Livrables de contrôle

- Capture desktop, tablette et mobile après intégration.
- Contrôle des 10 noms d'apps : **Fichiers, Photos, Agenda, Tâches, Talk, Contacts, Mail, Activité, Deck, Notes**.
- Aucun élément cassé dans les modules réels (Fichiers / prévisualisation / stockage / navigation / agenda).
- Palette et icônes cohérentes sur fond sombre.
- Bundle sans dépendance réseau ajoutée par le thème.

## 8. Important

Les images `references/` proviennent des rendus approuvés dans cette conversation. Les SVG ont été conçus pour une intégration et peuvent être colorés/modifiés. Les rendus de référence montrent une **intention**; les proportions finales doivent suivre le layout Nextcloud réel.
