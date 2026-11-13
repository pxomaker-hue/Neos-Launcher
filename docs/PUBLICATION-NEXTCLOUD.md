# Publier Neos dans le catalogue Nextcloud

L’identifiant de l’application est `novadashboard`. Il correspond au répertoire d’installation et à l’identifiant déjà utilisé par les installations manuelles. Neos v0.7.0 cible Nextcloud 35 et nécessite PHP 8.3 ou supérieur.

## 1. Préparer le paquet

Depuis la racine du dépôt, avec Node.js et `tar` disponibles, construis l’archive de contrôle.

```sh
node scripts/package-appstore.mjs
```

Le script produit `dist/novadashboard-0.7.0-unsigned.tar.gz`. Il embarque le code et les ressources installables dans le dossier `novadashboard/`, les changelogs du catalogue et la licence AGPL. Les scripts propres au NAS, les anciennes archives, les tests et les maquettes sont exclus.

Avant une publication stable, exécute les parcours de la [checklist v0.7](../novadashboard/PLAN-v0.7.md) sur une instance Nextcloud 35.0.3, y compris l’installation et la mise à jour depuis une installation manuelle.

## 2. Demander le certificat

Le mainteneur génère la clé sur sa machine, dans un répertoire privé extérieur au dépôt. Exemple pour un terminal Linux avec OpenSSL, dans lequel `cert_dir` désigne le répertoire privé.

```sh
umask 077
cert_dir="$HOME/.nextcloud/certificates"
mkdir -p "$cert_dir"
openssl req -new -newkey rsa:4096 -keyout "$cert_dir/novadashboard.key" \
  -out "$cert_dir/novadashboard.csr" -subj "/CN=novadashboard"
```

Ouvre une demande dans le [dépôt de certificats Nextcloud](https://github.com/nextcloud/app-certificate-requests) en joignant uniquement la demande publique sous `novadashboard/novadashboard.csr`, avec un lien vers le dépôt Neos. Nextcloud remet ensuite `novadashboard.crt`. La clé `.key` reste sous le contrôle du mainteneur.

## 3. Signer et publier

Sur une machine disposant de Nextcloud 35, extrais l’archive de contrôle dans un dossier de préparation. Puis, depuis le dossier qui contient `occ`, signe le répertoire extrait. Le fichier `appinfo/signature.json` doit être créé avant l’archivage final.

```sh
php occ integrity:sign-app \
  --privateKey="$cert_dir/novadashboard.key" \
  --certificate="$cert_dir/novadashboard.crt" \
  --path="$staging_dir/novadashboard"
tar -czf "$staging_dir/novadashboard-0.7.0.tar.gz" -C "$staging_dir" novadashboard
openssl dgst -sha512 -sign "$cert_dir/novadashboard.key" \
  "$staging_dir/novadashboard-0.7.0.tar.gz" | openssl base64 -A
```

Publie le `.tar.gz` signé comme fichier joint à une release GitHub. Enregistre l’identifiant avec le certificat public sur [apps.nextcloud.com](https://apps.nextcloud.com/), puis soumets le lien HTTPS du fichier et sa signature SHA-512. Le [guide officiel de publication](https://nextcloudappstore.readthedocs.io/en/stable/developer.html#publishing-apps-on-the-app-store) détaille le formulaire.
