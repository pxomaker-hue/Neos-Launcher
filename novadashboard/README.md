## Neos v0.7.0 — Recherche étendue, Agenda et Mail

- Fichiers recherche par nom dans l’index Nextcloud et permet de parcourir les résultats par lots.
- Notes charge les pages de la collection en arrière-plan et préserve le brouillon pendant la recherche.
- Contacts consulte tous les carnets accessibles et récupère les fiches CardDAV par lots.
- Agenda affiche les occurrences renvoyées par CalDAV. Création d’une répétition simple, modification du titre, du lieu et de la description d’une série, édition des occurrences individuelles prises en charge.
- Mail reprend les pièces jointes d’un brouillon IMAP dans une copie en texte simple via l’API Mail.
- La navigation se replie en icônes sur écran réduit, avec plusieurs lignes selon l’espace disponible.

## Neos v0.6.51 — Recherche dans Notes

- Recherche par titre et contenu dans les notes chargées, avec compteur de résultats et bouton Effacer. Les accents et majuscules sont ignorés.
- La recherche filtre la liste pendant la saisie et laisse la note sélectionnée et le brouillon ouverts.

## Neos v0.6.50 — Accueil et widget À suivre

- À suivre remplace Synthèse avec les tâches du jour, les retards et le prochain événement. Les raccourcis ouvrent les vues correspondantes.
- Les fichiers récents ouvrent Fichiers avec un aperçu, y compris lorsque le fichier se trouve au-delà de la première page.
- Le stockage indisponible et les dossiers en chargement sont signalés. La note rapide conserve sa saisie pendant les actualisations et affiche le résultat de la sauvegarde.

## Neos v0.6.49 — Recherche et filtres Deck

- Recherche dans les titres et descriptions du tableau ouvert, sans distinction d’accents ou de casse.
- Filtres combinables par état et échéance, avec compteurs par colonne. Une colonne sans résultat reste disponible pour ajouter ou déplacer une carte.
- Les filtres sont conservés pendant l’actualisation du tableau et réinitialisés lors d’un changement de tableau.

## Neos v0.6.48 — Notes, Planning, Fichiers et Tâches

- La sauvegarde d’une note préserve le brouillon affiché lorsque le texte ou la sélection a changé.
- Planning charge sa propre période. Agenda recharge sa période au retour si nécessaire.
- Fichiers et le sélecteur de destination chargent les dossiers par lots de 160. Le tri et le filtre portent sur les éléments chargés.
- Tâches filtre par liste, recherche dans les réponses des listes consultées et affiche les résultats par lots de 50.
- Agenda permet de modifier les événements simples datés en UTC. Les modifications vérifient la version CalDAV avant d’enregistrer.
- Mail charge davantage de messages dans les boîtes de réception et permet de télécharger les pièces jointes reconnues.

## Neos v0.6.47 — Recherche dans les tâches

Recherche par titre, description et liste, combinée aux vues d’échéance. Les accents et majuscules sont ignorés ; plusieurs mots doivent tous correspondre. Les compteurs suivent la recherche parmi les tâches chargées. Bouton Effacer et curseur conservé pendant la saisie.

## Neos v0.6.46 — Tâches par échéance

Vues Aujourd’hui, En retard, 7 prochains jours et Sans échéance avec compteurs. Les tâches terminées sont exclues de ces quatre vues. Les dates sont comparées au jour local ; les sept prochains jours commencent demain. Les compteurs concernent les tâches chargées.

## Neos v0.6.45 — Parcours clavier des destinations

Le sélecteur de dossier préserve la saisie du filtre pendant le chargement et permet de parcourir les dossiers avec les flèches.

## Neos v0.6.44 — Logo et sélecteur de dossiers

Le logo bénéficie d'un halo plus visible et de plus d'espace à gauche. La fenêtre de destination des fichiers décrit mieux ses états aux lecteurs d'écran.

## Neos v0.6.43 — Halo elliptique

Le fond du logo s'efface sur les bords et respire lentement lorsque les animations sont actives.

## Neos v0.6.42 — Halo de fond du logo

Un halo cyan permanent et un quadrillage léger accompagnent le logo dans l'en-tête du dashboard.

## Neos v0.6.41 — Symbole cyber 05 dans l'en-tête

Le nouveau N à quatre points accompagne la typographie et la disposition déjà présentes dans le dashboard.

## Neos v0.6.40 — Signature Dashboard énergisée

Le logo choisi est environ 10 % plus petit. Une double pulsation cyan anime le symbole N selon les préférences de mouvement.

## Neos v0.6.39 — Logo Dashboard animé

Le logo choisi affiche le sous-titre Dashboard et un balayage cyber discret, respectueux des préférences de mouvement.

## Neos v0.6.38 — Logo approuvé dans le dashboard

La barre supérieure affiche le deuxième logo généré choisi, avec un cadrage adapté aux tailles de fenêtre.

## Neos v0.6.37 — Nouveau logo cyber du dashboard

Le logo de la barre supérieure associe un monogramme N angulaire à un lettrage NEOS original. Deux SVG adaptés aux thèmes sombre et clair garantissent sa lisibilité.

## Neos v0.6.36 — Logo du dashboard plus lisible

Le mot-symbole de la barre supérieure est plus lisible sur ordinateur et mobile, en thème sombre ou clair.

## Neos v0.6.33 — Widget Tâches incluant Deck

Le widget d’accueil montre les tâches CalDAV et Deck déjà consultables dans le module Tâches ; mise à jour non destructive. Installe via Deploy-Neos.ps1 après sauvegarde.

## Neos v0.6.32 — création de tâches CalDAV

Le widget Tâches mène au module complet. La création tient compte du droit DAV:bind sur les listes CalDAV ; les cartes Deck restent gérées par Deck. Consulte CHANGELOG.md et PLAN-v0.7.md.

# v0.6.29 : recherche au clavier contextuelle, effacement par Échap, accès direct au contenu et maintien du focus des filtres.

## Neos 0.6.26 — Activité : pagination fiable et résultats accessibles

Le module Activité affiche les activités chargées par lots de 15, même après plusieurs pages serveur. Filtres locaux par source et période (7/30 jours). Un compteur indique le nombre réellement chargé. Contacts optimise la recherche dans les grands carnets. Aucune mutation des données Nextcloud n'est ajoutée par cette version.

## Neos 0.6.25 — Contacts plus accessibles

Le module Contacts propose maintenant la recherche dans les deux numéros et les deux adresses mail, le choix du carnet et un affichage progressif par lots de 35. Les très grands carnets donnent un avertissement explicite sur les limites côté Neos. Les modifications CardDAV, Talk, Mail et Planning conservent leurs API et comportements déjà validés.

## Neos v0.6.24 — stabilité Talk/Mail

- Talk : actualisation non destructive des historiques, pagination et défilement préservés.
- Mail : reprise d'une lecture ayant échoué, sans suppression/envoi ; synchro Réception mise en pause pendant la consultation Brouillons.
- Contacts, Planning, Deck, Tâches, topbar et Flat Cyber conservés.

# Neos v0.6.20 — Nextcloud 35

Application `novadashboard` pour Nextcloud 35 et installation OMV/LinuxServer.io. Cette version corrige le transfert vers le dossier IMAP des brouillons Mail et ajoute un filtre de conversations Talk non lues. Design Flat Cyber et modules historiques conservés.

Voir `INSTALLATION-OMV.md`, `CHANGELOG.md`, `TESTS.md` et `PLAN-v0.7.md`. Ne pas envoyer de message réel pour tester les brouillons.

## Neos v0.6.28 — compteurs simplifiés

Les modules Mail, Talk, Contacts et Activité affichent désormais un nombre cyan suivi du seul mot « élément(s) ». Le compteur de résultats de recherche ne s’affiche que lorsqu’un filtre ou une recherche est appliqué. Les fonctions existantes restent inchangées.

## Neos v0.6.27

La pagination du flux Activité suit désormais le lien HTTP `rel="next"` et le curseur OCS. Le panneau Activité conserve l'accès à l'historique plus ancien même lorsque le serveur regroupe moins de 30 éléments dans sa réponse. Mail, Talk, Contacts et Activité utilisent un seul titre de panneau, sans répéter celui-ci dans le bandeau descriptif.
