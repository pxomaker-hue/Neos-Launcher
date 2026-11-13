import {execFileSync} from 'node:child_process';
import {copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const appId = 'novadashboard';
const source = join(root, appId);
const info = readFileSync(join(source, 'appinfo', 'info.xml'), 'utf8');
const version = /<version>(\d+\.\d+\.\d+)<\/version>/.exec(info)?.[1];
if (!version || !info.includes(`<id>${appId}</id>`)) throw new Error('Identifiant ou version Nextcloud invalide.');

const dist = join(root, 'dist');
mkdirSync(dist, {recursive: true});
const stagePrefix = join(dist, 'neos-appstore-');
const stage = mkdtempSync(stagePrefix);
const target = join(stage, appId);
const archiveName = `${appId}-${version}-unsigned.tar.gz`;
const candidate = join(stage, archiveName);
const output = join(dist, archiveName);

try {
  mkdirSync(target);
  for (const directory of ['appinfo', 'css', 'img', 'js', 'lib', 'templates']) {
    cpSync(join(source, directory), join(target, directory), {
      recursive: true,
      filter: name => name !== join(source, 'appinfo', 'signature.json'),
    });
  }
  for (const name of ['CHANGELOG.md', 'CHANGELOG.fr.md']) {
    copyFileSync(join(source, name), join(target, name));
  }
  copyFileSync(join(root, 'LICENSE'), join(target, 'COPYING'));
  execFileSync('tar', ['-czf', candidate, '-C', stage, appId]);

  const entries = execFileSync('tar', ['-tzf', candidate], {encoding: 'utf8'}).trim().split(/\r?\n/);
  if (entries.some(name => !name.startsWith(`${appId}/`) || name.split('/').includes('.git')) ||
      !entries.includes(`${appId}/appinfo/info.xml`) || !entries.includes(`${appId}/COPYING`) ||
      statSync(candidate).size > 20 * 1024 * 1024) {
    throw new Error('Le paquet ne respecte pas la structure ou la taille attendue.');
  }
  copyFileSync(candidate, output);
  console.log(output);
} finally {
  if (stage.startsWith(stagePrefix)) rmSync(stage, {recursive: true, force: true});
}
