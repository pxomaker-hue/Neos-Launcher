# Validation de Neos v0.7.0 sur Nextcloud 35.0.3

Les tests automatisés utilisent des données fictives. Les scénarios ci-dessous nécessitent une instance de test ou des éléments de test sur le NAS.

1. Déployer le ZIP avec Deploy-Neos.ps1. Vérifier la version des fichiers et la version installée, l’ouverture du dashboard et la disponibilité de la sauvegarde. Répéter le retour arrière sur une instance de test.
2. Dans À suivre, ouvrir une tâche du jour et une tâche en retard. Comparer au module Tâches et au Planning. Vérifier aussi le prochain événement, une liste en lecture seule et une liste indisponible. Sur des éléments de test, créer et modifier une tâche, une carte et un événement.
3. Dans Agenda, créer une répétition hebdomadaire, modifier la série puis une occurrence. Vérifier les jours suivants dans Agenda natif, une exception existante, un calendrier en lecture seule et une modification concurrente.
4. Dans Mail, charger des messages anciens et réessayer une lecture interrompue. Copier un brouillon IMAP contenant un PDF et une image, enregistrer la copie et comparer ses pièces jointes avec celles de l’original dans Mail natif.
5. Remonter dans Activité jusqu’aux entrées d’avant le 11 novembre 2026 à 15 h 52. Charger plusieurs pages de Talk, puis actualiser en vérifiant la position de lecture. Rechercher un contact au-delà de 250 fiches dans un carnet, une note ancienne et un fichier dans un dossier profond.
6. Au clavier, parcourir la topbar, la recherche, les destinations et l’éditeur Agenda. Vérifier le retour du focus à la fermeture et l’annonce des erreurs. En écran réduit, vérifier les 12 icônes et le passage sur plusieurs lignes sans défilement horizontal.

## Périmètre de l’édition Agenda

Neos édite le titre, le lieu et la description d’une série. Il édite aussi les dates des séries UTC simples et des occurrences horaires. Agenda natif reste disponible pour les règles de répétition avancées, les séries avec invitations et les modifications qui affectent toutes les occurrences suivantes.

## Après Neos v0.6.35
- Vérifier au clavier et avec un lecteur d’écran la fenêtre Accès aux fichiers sur le NAS.
- Poursuivre l’audit des autres fenêtres complexes avant v0.7.

## Après Neos v0.6.34
- Confirmer sur NAS les états d’erreur du widget Tâches en cas de liste CalDAV indisponible.
- Poursuivre l’audit d’accessibilité clavier et des boîtes de dialogue complexes avant v0.7.

## Après Neos v0.6.31
- Vérifier les notifications et états asynchrones sur NAS avec vrais appels serveur (Agenda, Deck, CardDAV).
- Continuer l'audit WCAG des widgets, l'ergonomie mobile et les erreurs en v0.6.32.
- Éviter de modifier les pièces jointes IMAP d'origine ; la copie de texte reste volontairement non destructive.

# v0.6.29 : amélioration progressive de l’accessibilité clavier, raccourcis non destructifs et focus conservé. Prochaine étape : stabilisation du focus et des annonces sur les boîtes de dialogue complexes.

# Feuille de route v0.7 — après v0.6.26

| Zone | Acquis | Reste à valider |
| --- | --- | --- |
| Contacts | Deux courriels, deux téléphones, création/édition/suppression ETag validées ; filtre par carnet et liste progressive en v0.6.26 | Tester les grands carnets réels, limites à 250 par carnet / 400 chargées ; rechercher une future pagination distante sans modifier les données |
| Talk | Envoi, lecture, marqueur lu ; actualisation prudente et conservation de l’historique | Vérifier la pagination sur historique long et l'actualisation sur NAS |
| Mail | Brouillons IMAP et reprise texte non destructive, lecture HTML sécurisée, envoi, relecture après erreur | Tester le bouton Réessayer sur NAS ; pièce jointe dans la copie uniquement après API validée |
| Activité | Filtres et pagination OCS | Tester un historique réel volumineux |
| Planning/Deck/Tâches/Agenda | Parcours fonctionnels validés | Audit de régression, échéances et permissions |
| Design | Flat Cyber, icône Planning orange et topbar réorganisable | Affiner l’accessibilité clavier et le mobile |

Toute modification destructive demeure conditionnée à une confirmation et, si applicable, à une vérification ETag. Les ZIP sont publiés sur GitHub et déployés après sauvegarde OMV.

## Priorités après Neos 0.6.28

1. Confirmer l'historique Activité sur NAS jusqu'aux événements antérieurs au 11 novembre 2026 à 15 h 52 et vérifier les filtres « Toutes les dates ».
2. Consolider les cas de gros historiques et les états de chargement (API Nextcloud).
3. Poursuivre l'accessibilité clavier, les tailles mobiles et les contrôles de non-régression avant v0.7.
