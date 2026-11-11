# Déployer Neos avec une seule saisie sudo

Le script `Deploy-Neos.ps1` vérifie le ZIP, le transfère par SCP, puis ouvre une session SSH interactive sur le NAS. Un seul appel à `sudo /bin/bash` lance toute l'installation distante avec les droits nécessaires. Les commandes suivantes s'exécutent dans ce même processus et ne rappellent pas sudo. Le mot de passe sudo reste saisi directement dans le terminal SSH : il n'est ni inscrit dans le script, ni transmis par PowerShell, ni enregistré dans un fichier.

## Lancer le déploiement

Place le script corrigé dans le dossier qui contient les ZIP Neos, puis ouvre PowerShell et lance :

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "X:\Travail\Apprentissage\Codage\Neos Launcher\Deploy-Neos.ps1"
```

Le script choisit le ZIP `neos-nextcloud35-vX.Y.Z.zip` le plus récent. Pour choisir un ZIP précis :

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "X:\Travail\Apprentissage\Codage\Neos Launcher\Deploy-Neos.ps1" -ZipPath "X:\Travail\Apprentissage\Codage\Neos Launcher\neos-nextcloud35-v0.6.21.zip"
```

Après le récapitulatif, saisis `INSTALLER`. SSH peut demander son propre mot de passe lors des deux transferts SCP et de la connexion. Pendant l'installation, saisis le mot de passe **sudo du NAS une seule fois**, lorsqu'il apparaît dans la session SSH. Cette méthode ne dépend pas du délai d'expiration de l'autorisation sudo sur le NAS. Si ton compte n'a pas le droit de lancer `/bin/bash` avec sudo, le script s'arrête avant la sauvegarde et la copie.

## Contrôles et retour arrière

Le script contrôle l'état de Nextcloud, le chemin de l'application et l'archive avant toute modification. Si Nextcloud demande déjà une mise à niveau au début, le déploiement s'arrête pour éviter de mélanger deux opérations.

Il crée une sauvegarde des **fichiers de Neos** dans le conteneur, sous `/config/neos-backup-avant-v...tar.gz`, puis copie la nouvelle version et rétablit les permissions. Après la copie, il lit l'état de Nextcloud et la version de Neos enregistrée en base. Si une migration est nécessaire, il lance `docker exec nextcloud occ upgrade` depuis la session déjà élevée (avec le nom de conteneur choisi), puis vérifie la version des fichiers, la version enregistrée en base et l'état final de Nextcloud avant d'annoncer le succès.

En cas d'échec après le début de la copie **mais avant** `occ upgrade`, il tente de restaurer les fichiers sauvegardés. Des fichiers nouveaux de la mise à jour peuvent subsister. Si une erreur survient après le début de `occ upgrade`, le script signale le problème et conserve la sauvegarde, mais ne restaure pas les anciens fichiers automatiquement : la migration a pu modifier la base de données et une restauration limitée aux fichiers pourrait aggraver l'incohérence. Dans ce cas, consulte le journal Nextcloud et reprends la mise à niveau ou restaure une sauvegarde complète de l'instance.

La vérification effectuée ici est locale. Le déploiement et la restauration doivent être confirmés sur le NAS lors de l'utilisation réelle.
