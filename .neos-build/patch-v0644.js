const fs = require('node:fs');
const path = require('node:path');

const appDir = process.argv[2];
if (!appDir) throw new Error('Application directory required');
function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first < 0 || text.indexOf(before, first + before.length) >= 0) throw new Error(`Expected one ${label} anchor`);
  return text.slice(0, first) + after + text.slice(first + before.length);
}

const jsPath = path.join(appDir, 'js/app.js');
let js = fs.readFileSync(jsPath, 'utf8');
if (!js.includes('NEOS 0.6.43</span>') || !js.includes('neos-logo-05-hybrid-v0641.png')) {
  throw new Error('Expected published Neos v0.6.43 source');
}
// The destination picker is the next complex dialog in the v0.7 keyboard and
// asynchronous-state audit. Keep file operations and their permissions intact.
js = replaceOnce(js,
  'data-action="destination-up" ${p.path===\'/\'?\'disabled\':\'\'} title="Remonter d’un dossier"',
  'data-action="destination-up" ${p.path===\'/\'?\'disabled\':\'\'} title="Remonter d’un dossier" aria-label="Remonter d’un dossier"',
  'destination up label');
js = replaceOnce(js,
  'class="neos-path-root" data-action="destination-browse" data-path="/"',
  'class="neos-path-root" data-action="destination-browse" data-path="/" aria-label="Racine des fichiers"',
  'destination root label');
js = replaceOnce(js,
  '<label class="neos-destination-search">${icon(\'search\',16)}<input',
  '<label class="neos-destination-search">${icon(\'search\',16)}<span class="neos-sr-only">Filtrer les dossiers</span><input',
  'destination search label');
js = replaceOnce(js,
  '<div class="neos-destination-empty"><span class="neos-spinner"></span></div>',
  '<div class="neos-destination-empty" role="status" aria-live="polite"><span class="neos-spinner" aria-hidden="true"></span>Chargement des dossiers…</div>',
  'destination loading state');
js = replaceOnce(js,
  '<div class="neos-destination-empty neos-destination-error">${icon(\'alert\',18)} ${esc(p.error)}</div>',
  '<div class="neos-destination-empty neos-destination-error" role="alert">${icon(\'alert\',18)} ${esc(p.error)}</div>',
  'destination error state');
js = replaceOnce(js,
  '<div class="neos-destination-empty">Aucun sous-dossier</div>',
  '<div class="neos-destination-empty" role="status">Aucun sous-dossier</div>',
  'destination empty state');
js = replaceOnce(js,
  '<div class="neos-destination-empty">Aucun dossier correspondant</div>',
  '<div class="neos-destination-empty" role="status">Aucun dossier correspondant</div>',
  'destination filter empty state');
js = replaceOnce(js, 'NEOS 0.6.43</span>', 'NEOS 0.6.44</span>', 'footer version');
fs.writeFileSync(jsPath, js);

const cssPath = path.join(appDir, 'css/app.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('/* v0.6.44:')) throw new Error('Logo visibility already adjusted');
css += `
/* v0.6.44: expose the left orbit and strengthen the elliptical halo */
#nova-root .neos-symbol-crop{left:0;width:63px}
#nova-root .neos-symbol-crop img.neos-symbol-five{left:-23px}
#nova-root .neos-brand-mark{--neos-halo-min:.88;--neos-halo-max:1}
#nova-root .neos-brand-mark::before{background-image:radial-gradient(ellipse 72% 105% at 38% 52%,rgba(0,226,230,.38),rgba(18,94,144,.19) 48%,transparent 78%),linear-gradient(rgba(94,214,237,.26) 1px,transparent 1px),linear-gradient(90deg,rgba(94,214,237,.26) 1px,transparent 1px)}
#nova-root[data-motion="subtle"] .neos-brand-mark{--neos-halo-min:.86;--neos-halo-max:.96}
#nova-root[data-motion="off"] .neos-brand-mark::before{opacity:.94}
@media(max-width:1160px){
  #nova-root .neos-symbol-crop{left:0;width:55px}
  #nova-root .neos-symbol-crop img.neos-symbol-five{left:-22px}
}
@media(max-width:760px){
  #nova-root .neos-symbol-crop{left:0;width:47px}
  #nova-root .neos-symbol-crop img.neos-symbol-five{left:-17px}
}
@media(prefers-reduced-motion:reduce){
  #nova-root .neos-brand-mark::before{opacity:.94!important}
}
`;
fs.writeFileSync(cssPath, css);

const infoPath = path.join(appDir, 'appinfo/info.xml');
fs.writeFileSync(infoPath, replaceOnce(fs.readFileSync(infoPath, 'utf8'), '<version>0.6.43</version>', '<version>0.6.44</version>', 'app version'));
const changelog = path.join(appDir, 'CHANGELOG.md');
fs.writeFileSync(changelog, `## 0.6.44 — Logo moins rogné et sélecteur de dossiers accessible

- Le halo elliptique et le quadrillage sont légèrement renforcés ; le symbole 05 n'est plus rogné à gauche.
- La fenêtre Copier/Déplacer annonce le chargement, les erreurs et les résultats vides des dossiers.
- Ses boutons d'icône et son filtre de dossiers ont désormais des noms accessibles.
- Les transferts de fichiers et les données Nextcloud restent inchangés.

` + fs.readFileSync(changelog, 'utf8'));
const readme = path.join(appDir, 'README.md');
fs.writeFileSync(readme, `## Neos v0.6.44 — Logo et sélecteur de dossiers

Le logo bénéficie d'un halo plus visible et de plus d'espace à gauche. La fenêtre de destination des fichiers décrit mieux ses états aux lecteurs d'écran.

` + fs.readFileSync(readme, 'utf8'));
console.log('Patched Neos v0.6.44');
