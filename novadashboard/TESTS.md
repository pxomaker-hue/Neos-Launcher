## Neos v0.6.31 — états accessibles

Ajout des états de sauvegarde et annonces accessibles dans les dialogues ; intégrations Nextcloud inchangées. Consulte CHANGELOG.md et PLAN-v0.7.md.

# v0.6.29 : tests Chromium desktop/mobile : / dans Mail, Talk, Contacts, Activité et Fichiers ; Échap recherche ; focus filtres ; pas de régression JS ; NAS à valider.

# Tests v0.6.26 (préparation)

- Activité : charger plusieurs pages, puis afficher 15 éléments supplémentaires sans plafond à 70 ; filtres source et période, conservation du focus, pas de doublons, réponses périmées ignorées.
- Contacts : recherche secondaire e-mail et téléphone, filtre par carnet, progression 35/70/105 et suppression annulée, sans écritures au serveur.
- Talk : lecture/conversation ; Mail : brouillons et lecture ; version affichée NEOS 0.6.26.
- Tester sur NAS avec des activités plus anciennes que 70 entrées. La période filtre uniquement les activités déjà chargées dans Neos.

# Tests v0.6.25 (préparation)

- Contacts : rechercher dans les champs secondaires, sélectionner un carnet, revenir à tous les carnets ; ouvrir une fiche filtrée ; afficher les contacts par groupes de 35 ; appuyer sur Échap pour annuler une confirmation de suppression.
- Vérifier Contacts natif si plus de 400 fiches : le message de limitation est explicite ; aucun ajout/suppression automatique de contacts n'est effectué.
- Vérifier la création, l'édition et la suppression uniquement avec une fiche de test (ETag inchangé depuis 0.6.24).
- Vérifier que Talk conserve la conversation et sa position de lecture, et que les brouillons Mail, y compris vides, sont toujours consultables.
- Conserver l'icône Planning orange, l'ordre topbar et l'apparence Flat Cyber.

# Tests v0.6.24 — à valider sur NAS

- Talk : rafraîchissement manuel/automatique, conservation des messages anciens chargés et pagination.
- Talk : position dans la conversation et focus du texte conservés après rafraîchissement ; erreur réseau simulée non destructive.
- Mail : affichage du bouton « Réessayer la lecture » après échec IMAP et relecture depuis le même message, sans écriture.
- Mail : synchronisation Réception bloquée pendant la consultation Brouillons / lecture / rédaction ; bouton désactivé avec une explication.
- Contacts : régression création/édition/suppression inchangées ; suppression à tester uniquement sur fiche fictive.
- Vérifier l'affichage « NEOS 0.6.24 » et l'ordre topbar et l'icône Planning conservés.

# Tests v0.6.23 — à valider sur NAS

- Brouillon IMAP vide : reprise autorisée seulement après chargement réussi, éditeur texte vide, original inchangé.
- Brouillon IMAP avec texte : reprise identique à v0.6.22.
- Erreur de lecture IMAP : aucune reprise autorisée.
- L’envoi d’un courriel vide reste refusé par la validation Neos.

# Tests Neos v0.6.20

## Environnement

- Base : ZIP officiel Neos v0.6.19 de cette conversation.
- Nouvelle archive : v0.6.20 pour Nextcloud 35 / LinuxServer.io.
- Chromium headless local (aperçu autonome sur données fictives), ordinateur 1440×900 et mobile 420×900.

## Résultats

- Syntaxe JavaScript : `node --check` OK.
- Contacts : création vCard 3.0 avec 2 EMAIL/2 TEL ; modification d'une vCard avec conservation d'un troisième courriel, d'une PHOTO et d'un champ X-NEOS-CUSTOM : OK (tests JS).
- Interfaces : ouverture de Mail, liste Brouillons, ouverture du détail et retour, formulaire Contacts avec champs supplémentaires, validation de démonstration : OK.
- Erreurs JavaScript sur les scénarios visuels : aucune détectée.
- Archive ZIP : contenu, structure et intégrité contrôlés.

## Limites

- Aucune authentification à ton NAS lors des tests : la consultation des vrais brouillons et l'écriture CardDAV des valeurs multiples doivent être validées.
- Les brouillons IMAP sont lus dans Neos mais **ne sont pas édités ni supprimés par Neos**. Le bouton d'édition ouvre Mail natif pour préserver les éventuelles pièces jointes et propriétés non prises en charge.
- Les captures sont des captures d'exécution de l'aperçu avec des données fictives, pas de ton NAS.

## v0.6.28 — Tests de régression

- Syntaxe JS/PHP et intégrité ZIP : vérifiés.
- Simulations de réponse OCS : moins de 30 événements avec `Link: rel="next"`, curseur sans `Link`, réponse vide, affichage progressif 15 → 105 événements.
- Aperçu Chromium desktop/mobile : un seul titre par panneau intégré, présentation compacte, navigation dans les 4 modules sans erreur JS.
- NAS réel : à valider, en particulier le retour aux activités d'avant le 11 novembre 2026 à 15 h 52.
