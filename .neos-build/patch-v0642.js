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
if (!js.includes('NEOS 0.6.41</span>') || !js.includes('neos-logo-05-hybrid-v0641.png')) {
  throw new Error('Expected published Neos v0.6.41 source');
}
js = replaceOnce(js, 'NEOS 0.6.41</span>', 'NEOS 0.6.42</span>', 'footer version');
fs.writeFileSync(jsPath, js);

const cssPath = path.join(appDir, 'css/app.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('/* v0.6.42:')) throw new Error('Logo halo already present');
css += `
/* v0.6.42: steady energy halo and fine grid behind the dashboard logo */
#nova-root .neos-brand-mark::before{content:"";position:absolute;z-index:0;inset:0;pointer-events:none;background-image:radial-gradient(ellipse 72% 105% at 38% 52%,rgba(0,226,230,.21),rgba(18,94,144,.10) 48%,transparent 78%),linear-gradient(rgba(94,214,237,.13) 1px,transparent 1px),linear-gradient(90deg,rgba(94,214,237,.13) 1px,transparent 1px);background-size:100% 100%,14px 14px,14px 14px;background-position:0 0,3px 3px,3px 3px;mask-image:radial-gradient(ellipse 85% 105% at 38% 52%,#000 32%,transparent 100%);opacity:.9}
#nova-root .neos-brand-mark img.neos-wordmark-approved{z-index:1}
`;
fs.writeFileSync(cssPath, css);

const infoPath = path.join(appDir, 'appinfo/info.xml');
fs.writeFileSync(infoPath, replaceOnce(fs.readFileSync(infoPath, 'utf8'), '<version>0.6.41</version>', '<version>0.6.42</version>', 'app version'));
const changelog = path.join(appDir, 'CHANGELOG.md');
fs.writeFileSync(changelog, `## 0.6.42 — Halo et quadrillage derrière le logo

- Un halo cyan et un quadrillage fin restent visibles derrière la signature NEOS du dashboard.
- Le symbole 05, la typographie, le sous-titre et la pulsation de la v0.6.41 sont conservés.
- Le fond est statique et reste visible lorsque les animations sont désactivées.
- Les fonctions et données Nextcloud restent inchangées.

` + fs.readFileSync(changelog, 'utf8'));
const readme = path.join(appDir, 'README.md');
fs.writeFileSync(readme, `## Neos v0.6.42 — Halo de fond du logo

Un halo cyan permanent et un quadrillage léger accompagnent le logo dans l'en-tête du dashboard.

` + fs.readFileSync(readme, 'utf8'));
console.log('Patched Neos v0.6.42');
