#Requires -Version 5.1
<#
.SYNOPSIS
  Deploie un ZIP Neos sur Nextcloud (OpenMediaVault / LinuxServer.io).
.DESCRIPTION
  Recherche la plus recente archive neos-nextcloud35-vX.Y.Z.zip dans le dossier
  de releases (ou utilise -ZipPath), verifie l'archive, transfere les fichiers
  par SCP, sauvegarde l'application sur le NAS et installe la mise a jour.
  Verifie ensuite la version de Neos et lance occ upgrade si Nextcloud ou
  l'application demande une migration, puis controle le resultat final.
  Charge une fois la cle SSH dans l'agent OpenSSH Windows (sans stocker
  sa phrase secrete), puis reutilise la meme cle pour tous les transferts.
  Lance le script distant avec un seul appel sudo dans la session SSH
  interactive, sans conserver le mot de passe.
  En cas d'echec apres la copie, tente de restaurer les fichiers sauvegardes.
  Ne modifie pas les donnees des utilisateurs Nextcloud.
.EXAMPLE
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "X:\Travail\Apprentissage\Codage\Neos Launcher\Deploy-Neos.ps1"
.EXAMPLE
  .\Deploy-Neos.ps1 -ZipPath "X:\Travail\Apprentissage\Codage\Neos Launcher\neos-nextcloud35-v0.6.21.zip"
#>
[CmdletBinding()]
param(
    [string]$ZipPath,
    [string]$ReleasesDirectory = 'X:\Travail\Apprentissage\Codage\Neos Launcher',
    [string]$NasHost = '192.168.1.200',
    [string]$NasUser = 'ssh-pxo',
    [string]$ContainerName = 'nextcloud'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$temporaryScript = $null

function Assert-ExitCode([string]$Etape) {
    if ($LASTEXITCODE -ne 0) {
        throw "$Etape a echoue (code $LASTEXITCODE)."
    }
}

try {
    foreach ($program in @('ssh', 'scp')) {
        if (-not (Get-Command $program -ErrorAction SilentlyContinue)) {
            throw "Commande '$program' introuvable. Active le client OpenSSH de Windows."
        }
    }

    if ($NasHost -notmatch '^[a-zA-Z0-9.-]+$' -or
        $NasUser -notmatch '^[a-zA-Z0-9_-]+$' -or
        $ContainerName -notmatch '^[a-zA-Z0-9_-]+$') {
        throw 'Nom de NAS, utilisateur ou conteneur invalide.'
    }

    if ([string]::IsNullOrWhiteSpace($ZipPath)) {
        if (-not (Test-Path -LiteralPath $ReleasesDirectory -PathType Container)) {
            throw "Dossier des ZIP introuvable : $ReleasesDirectory"
        }
        $archives = @(
            Get-ChildItem -LiteralPath $ReleasesDirectory -File -Filter 'neos-nextcloud35-v*.zip' |
                ForEach-Object {
                    if ($_.Name -match '^neos-nextcloud35-v(\d+\.\d+\.\d+)\.zip$') {
                        [pscustomobject]@{
                            Fichier = $_
                            Version = [version]$Matches[1]
                        }
                    }
                } |
                Sort-Object -Property Version -Descending
        )
        if ($archives.Count -eq 0) {
            throw "Aucun ZIP Neos trouve dans : $ReleasesDirectory"
        }
        $ZipPath = $archives[0].Fichier.FullName
    }

    $archive = Get-Item -LiteralPath $ZipPath -ErrorAction Stop
    if ($archive.PSIsContainer) { throw "Le chemin indique n'est pas un fichier ZIP." }
    $nomFichier = $archive.Name
    $nomCorrespondance = [regex]::Match($nomFichier, '^neos-nextcloud35-v(\d+\.\d+\.\d+)\.zip$')
    if (-not $nomCorrespondance.Success) {
        throw 'Nom ZIP attendu : neos-nextcloud35-vX.Y.Z.zip'
    }
    $version = $nomCorrespondance.Groups[1].Value

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($archive.FullName)
    try {
        $infoEntry = $zip.GetEntry('novadashboard/appinfo/info.xml')
        if ($null -eq $infoEntry) {
            throw 'Archive incorrecte : novadashboard/appinfo/info.xml est absent.'
        }
        $stream = $infoEntry.Open()
        $lecteur = New-Object System.IO.StreamReader($stream)
        try {
            [xml]$info = $lecteur.ReadToEnd()
        }
        finally {
            $lecteur.Dispose()
        }
        if ([string]$info.info.id -ne 'novadashboard') {
            throw 'L archive ne contient pas l application novadashboard.'
        }
        if ([string]$info.info.version -ne $version) {
            throw "Version incoherente : nom du ZIP = $version, info.xml = $($info.info.version)."
        }
    }
    finally {
        $zip.Dispose()
    }

    $remote = "$NasUser@$NasHost"
    Write-Host ''
    Write-Host '========== DEPLOIEMENT NEOS ==========' -ForegroundColor Cyan
    Write-Host "Archive   : $($archive.FullName)"
    Write-Host "Version   : $version"
    Write-Host "NAS       : $remote"
    Write-Host "Conteneur : $ContainerName"
    Write-Host 'Une sauvegarde de Neos sera realisee avant toute copie.' -ForegroundColor Yellow
    Write-Host 'SSH via ssh-agent : une saisie de phrase secrete au plus, puis aucune pour les transferts.'
    Write-Host 'Un seul appel sudo lance toute l installation sur le NAS.'
    Write-Host ''
    $confirmation = Read-Host 'Tape INSTALLER pour confirmer'
    if ($confirmation -cne 'INSTALLER') {
        Write-Host 'Operation annulee. Aucun transfert effectue.'
        exit 0
    }

    # SSH: une phrase secrete maximum grace a l'agent Windows OpenSSH.
    # L'agent conserve la cle deverrouillee en memoire ; aucun secret n'est ecrit sur disque.
    Write-Host '[SSH] Preparation de la cle SSH...' -ForegroundColor Cyan
    $agentService = Get-Service -Name 'ssh-agent' -ErrorAction SilentlyContinue
    if ($null -eq $agentService) {
        throw 'Service ssh-agent absent. Installe le client OpenSSH de Windows.'
    }
    if ($agentService.Status -ne 'Running') {
        try {
            Start-Service -Name 'ssh-agent' -ErrorAction Stop
        }
        catch {
            throw 'Agent SSH indisponible. Une seule fois, ouvre PowerShell en administrateur et execute : Set-Service ssh-agent -StartupType Automatic ; Start-Service ssh-agent'
        }
    }

    $sshKey = Join-Path (Join-Path $env:USERPROFILE '.ssh') 'id_ed25519'
    if (-not (Test-Path -LiteralPath $sshKey -PathType Leaf) -or
        -not (Test-Path -LiteralPath "$sshKey.pub" -PathType Leaf)) {
        throw "Cle SSH ED25519 introuvable : $sshKey (et son fichier .pub)."
    }

    # Une cle peut deja etre chargee depuis un precedent deploiement.
    # Comparer les empreintes evite de re-saisir la phrase secrete inutilement.
    $publicKeyInfo = @(& ssh-keygen -lf "$sshKey.pub") -join " "
    Assert-ExitCode 'Lecture empreinte de la cle SSH'
    $fingerprintMatch = [regex]::Match($publicKeyInfo, 'SHA256:[a-zA-Z0-9+/=]+')
    if (-not $fingerprintMatch.Success) {
        throw 'Impossible de lire l empreinte SHA256 de la cle SSH.'
    }
    $fingerprint = $fingerprintMatch.Value
    $agentIdentities = @(& ssh-add -l 2>&1) -join " "
    if ($agentIdentities -notmatch [regex]::Escape($fingerprint)) {
        Write-Host 'Entre la phrase secrete de ta cle SSH une seule fois :' -ForegroundColor Yellow
        & ssh-add "$sshKey"
        Assert-ExitCode 'Chargement de la cle dans ssh-agent'
    }
    else {
        Write-Host '[SSH] Cle deja deverrouillee dans ssh-agent.' -ForegroundColor Green
    }

    # Echouer avant toute copie si le NAS refuse encore l authentification par cle.
    & ssh -o BatchMode=yes -o IdentitiesOnly=yes -i "$sshKey" "$remote" 'true'
    Assert-ExitCode 'Test de connexion SSH par cle'
    Write-Host '[SSH] Connexion validee : scp et ssh reutiliseront la meme cle.' -ForegroundColor Green

    # Cette partie s'execute sur le NAS via SSH. Les valeurs substituees sont
    # limitees a des noms ASCII verifies avant la construction du script.
    $scriptBash = @'
#!/usr/bin/env bash
set -Eeuo pipefail

CONTAINER='__CONTAINER__'
VERSION='__VERSION__'
ARCHIVE='/tmp/__ZIP_NAME__'
APP_PATH=''
BACKUP=''
STAGING=''
COPIE_DEMARREE=0
UPGRADE_DEMARREE=0

nettoyage() {
  if [[ -n "$STAGING" && -d "$STAGING" ]]; then
    rm -rf -- "$STAGING"
  fi
  rm -f -- "$0"
}

echec() {
  local code=$?
  local ligne="$1"
  trap - ERR
  echo "[ERREUR] Echec vers la ligne $ligne (code $code)."
  if [[ "$UPGRADE_DEMARREE" == '1' ]]; then
    echo '[ATTENTION] Une migration Nextcloud peut avoir modifie la base de donnees.'
    echo '[ATTENTION] Les fichiers ne sont pas restaures automatiquement apres le debut de occ upgrade.'
    echo '[ATTENTION] Verifie le journal Nextcloud et reprends la mise a niveau manuellement.'
  elif [[ "$COPIE_DEMARREE" == '1' && -n "$BACKUP" && -n "$APP_PATH" ]]; then
    echo '[RESTAURATION] Tentative de restauration de la sauvegarde...'
    if docker exec "$CONTAINER" tar -xzf "$BACKUP" -C "$APP_PATH" . &&
       docker exec "$CONTAINER" chown -R abc:abc "$APP_PATH"; then
      echo '[RESTAURATION] Fichiers sauvegardes recopies.'
      echo '[ATTENTION] Des fichiers nouveaux de la mise a jour peuvent subsister.'
    else
      echo '[ATTENTION] Restauration automatique incomplete.'
    fi
  fi
  if [[ -n "$BACKUP" ]]; then
    echo "[SAUVEGARDE] Disponible dans le conteneur : $BACKUP"
  fi
  exit "$code"
}
trap 'echec "$LINENO"' ERR
trap nettoyage EXIT

printf '\n[1/8] Verification des droits administrateur...\n'
if [[ "$EUID" -ne 0 ]]; then
  echo '[ERREUR] Le script distant doit etre lance avec sudo.'
  exit 1
fi

printf '\n[2/8] Etat de Nextcloud...\n'
ETAT="$(docker exec "$CONTAINER" occ status)"
printf '%s\n' "$ETAT"
grep -Eq 'maintenance:[[:space:]]*false' <<< "$ETAT" || { echo 'Nextcloud en maintenance ou etat inconnu.'; exit 1; }
grep -Eq 'needsDbUpgrade:[[:space:]]*false' <<< "$ETAT" || { echo 'Mise a niveau de la base requise ou etat inconnu.'; exit 1; }

printf '\n[3/8] Verification de l application installee...\n'
APP_PATH="$(docker exec "$CONTAINER" occ app:getpath novadashboard | tr -d '\r')"
case "$APP_PATH" in
  /*/novadashboard) ;;
  *) echo "Chemin Neos inattendu : $APP_PATH"; exit 1 ;;
esac
docker exec "$CONTAINER" test -f "$APP_PATH/appinfo/info.xml"
echo "Application : $APP_PATH"

printf '\n[4/8] Verification et extraction de l archive...\n'
test -f "$ARCHIVE"
python3 -m zipfile -t "$ARCHIVE"
STAGING="$(mktemp -d "/tmp/neos-v${VERSION}-XXXXXX")"
python3 -m zipfile -e "$ARCHIVE" "$STAGING"
test -f "$STAGING/novadashboard/appinfo/info.xml"
python3 - "$STAGING/novadashboard/appinfo/info.xml" "$VERSION" <<'PY'
import sys
import xml.etree.ElementTree as ET
root = ET.parse(sys.argv[1]).getroot()
assert root.findtext('id') == 'novadashboard', 'Identifiant incorrect'
assert root.findtext('version') == sys.argv[2], 'Version incorrecte'
PY

echo '[5/8] Sauvegarde de la version actuelle...'
DATE="$(date +%Y%m%d-%H%M%S)"
BACKUP="/config/neos-backup-avant-v${VERSION}-${DATE}.tar.gz"
docker exec "$CONTAINER" tar -czf "$BACKUP" -C "$APP_PATH" .
docker exec "$CONTAINER" test -s "$BACKUP"
echo "Sauvegarde : $BACKUP"

printf '\n[6/8] Installation de Neos v%s...\n' "$VERSION"
COPIE_DEMARREE=1
docker cp "$STAGING/novadashboard/." "${CONTAINER}:${APP_PATH}/"
docker exec "$CONTAINER" chown -R abc:abc "$APP_PATH"

printf '\n[7/8] Mise a niveau de Nextcloud si necessaire...\n'
ETAT_APRES_COPIE="$(docker exec "$CONTAINER" occ status)"
printf '%s\n' "$ETAT_APRES_COPIE"
BESOIN_MAJ=0
if grep -Eq 'needsDbUpgrade:[[:space:]]*true' <<< "$ETAT_APRES_COPIE"; then
  BESOIN_MAJ=1
elif grep -Eq 'needsDbUpgrade:[[:space:]]*false' <<< "$ETAT_APRES_COPIE"; then
  VERSION_BDD="$(docker exec "$CONTAINER" occ config:app:get novadashboard installed_version | tr -d '\r')"
  if [[ "$VERSION_BDD" != "$VERSION" ]]; then
    echo "Version Neos en base : ${VERSION_BDD:-absente} ; version attendue : $VERSION."
    BESOIN_MAJ=1
  fi
else
  echo '[ERREUR] Etat de migration Nextcloud inconnu.'
  false  # restaure les fichiers avant toute migration
fi

if [[ "$BESOIN_MAJ" == '1' ]]; then
  echo '[MISE A NIVEAU] Execution de occ upgrade...'
  UPGRADE_DEMARREE=1
  docker exec "$CONTAINER" occ upgrade
else
  echo '[MISE A NIVEAU] Aucune migration necessaire.'
fi

printf '\n[8/8] Verification finale de Neos et de Nextcloud...\n'
VERSION_INSTALLEE="$(docker exec "$CONTAINER" sh -c "grep -oE '<version>[^<]+</version>' '$APP_PATH/appinfo/info.xml' | head -n 1" | sed -E 's#</?version>##g')"
if [[ "$VERSION_INSTALLEE" != "$VERSION" ]]; then
  echo "Version des fichiers Neos incorrecte : ${VERSION_INSTALLEE:-absente} (attendue : $VERSION)."
  false
fi
VERSION_BDD="$(docker exec "$CONTAINER" occ config:app:get novadashboard installed_version | tr -d '\r')"
if [[ "$VERSION_BDD" != "$VERSION" ]]; then
  echo "Version Neos en base incorrecte : ${VERSION_BDD:-absente} (attendue : $VERSION)."
  false
fi
ETAT_FINAL="$(docker exec "$CONTAINER" occ status)"
printf '%s\n' "$ETAT_FINAL"
if ! grep -Eq 'maintenance:[[:space:]]*false' <<< "$ETAT_FINAL" ||
   ! grep -Eq 'needsDbUpgrade:[[:space:]]*false' <<< "$ETAT_FINAL"; then
  echo '[ERREUR] Nextcloud est encore en maintenance ou demande une mise a niveau.'
  false
fi
VERSION_NEXTCLOUD="$(sed -nE 's/^[[:space:]]*-[[:space:]]*versionstring:[[:space:]]*(.*)$/\1/p' <<< "$ETAT_FINAL" | head -n 1)"
if [[ -z "$VERSION_NEXTCLOUD" ]]; then
  echo '[ERREUR] Impossible de lire la version de Nextcloud.'
  false
fi
echo "Neos v$VERSION est installe (fichiers et base de donnees)."
echo "Nextcloud v$VERSION_NEXTCLOUD est operationnel."
echo "Sauvegarde : $BACKUP"
echo 'Dans le navigateur : Ctrl + F5.'
'@

    $scriptBash = $scriptBash.Replace('__CONTAINER__', $ContainerName)
    $scriptBash = $scriptBash.Replace('__VERSION__', $version)
    $scriptBash = $scriptBash.Replace('__ZIP_NAME__', $nomFichier)
    $scriptBash = $scriptBash.Replace("`r`n", "`n") + "`n"

    $identifiant = [guid]::NewGuid().ToString('N').Substring(0, 12)
    $nomShell = "neos-deploy-$identifiant.sh"
    $temporaryScript = Join-Path ([System.IO.Path]::GetTempPath()) $nomShell
    [System.IO.File]::WriteAllText(
        $temporaryScript,
        $scriptBash,
        (New-Object System.Text.UTF8Encoding($false))
    )

    Write-Host ''
    Write-Host '[TRANSFERT] Archive ZIP...' -ForegroundColor Cyan
    & scp -o BatchMode=yes -o IdentitiesOnly=yes -i "$sshKey" "$($archive.FullName)" "${remote}:/tmp/$nomFichier"
    Assert-ExitCode 'Transfert ZIP'

    Write-Host '[TRANSFERT] Script temporaire...' -ForegroundColor Cyan
    & scp -o BatchMode=yes -o IdentitiesOnly=yes -i "$sshKey" "$temporaryScript" "${remote}:/tmp/$nomShell"
    Assert-ExitCode 'Transfert du script'

    Write-Host '[INSTALLATION] Execution sur le NAS...' -ForegroundColor Cyan
    Write-Host '(Sudo peut demander son mot de passe une fois au lancement du script distant.)'
    & ssh -tt -o BatchMode=yes -o IdentitiesOnly=yes -i "$sshKey" $remote "sudo /bin/bash /tmp/$nomShell"
    Assert-ExitCode 'Installation distante'

    Write-Host ''
    Write-Host "SUCCES : Neos v$version deploye. Fais Ctrl + F5 dans le navigateur." -ForegroundColor Green
}
catch {
    Write-Host ''
    Write-Host "ECHEC : $($_.Exception.Message)" -ForegroundColor Red
    Write-Host 'En cas de probleme, conserve le chemin de sauvegarde affiche par le NAS.' -ForegroundColor Yellow
    exit 1
}
finally {
    if ($null -ne $temporaryScript -and (Test-Path -LiteralPath $temporaryScript)) {
        Remove-Item -LiteralPath $temporaryScript -Force -ErrorAction SilentlyContinue
    }
}
