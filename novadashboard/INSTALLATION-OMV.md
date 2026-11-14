# Installer Neos sur OpenMediaVault

Pour une instance Nextcloud 35 dans un conteneur LinuxServer.io, utilise le script `Deploy-Neos.ps1` à la racine du dépôt. Prépare l’accès SSH à ton NAS et vérifie le nom du conteneur Nextcloud.

Depuis le dossier qui contient le ZIP et le script, remplace les valeurs d’exemple par celles de ton instance.

```powershell
& .\Deploy-Neos.ps1 -ZipPath .\neos-nextcloud35-v0.7.5.zip `
    -NasHost 'nas.example.test' -NasUser 'utilisateur' -ContainerName 'nextcloud'
```

Le script affiche la version et la destination avant de demander `INSTALLER`. Il sauvegarde les fichiers de l’application dans le conteneur et vérifie la version installée. Conserve le chemin de sauvegarde affiché et vérifie l’ouverture de Neos après l’installation.

Pour les détails du déploiement et de la restauration, consulte le [guide PowerShell](../MODE-EMPLOI-DEPLOY-NEOS.md).
