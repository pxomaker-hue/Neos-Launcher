const fs = require('node:fs');
const path = require('node:path');

const appDir = process.argv[2];
if (!appDir) throw new Error('Application directory required');
const jsPath = path.join(appDir, 'js', 'app.js');
let js = fs.readFileSync(jsPath, 'utf8');
if (!js.includes('NEOS 0.6.35</span>') || !js.includes('nextSearchTab(')) {
  throw new Error('Expected the published Neos v0.6.35 source');
}
function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first < 0 || text.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Expected exactly one ${label} anchor`);
  }
  return text.slice(0, first) + after + text.slice(first + before.length);
}

js = replaceOnce(js,
  "  function brandMark(){return `<img src=\"${safeUrl(kitFile('branding/neos-wordmark.svg'))}\" alt=\"\" loading=\"eager\">`;}",
  "  function brandMark(){return `<img class=\"neos-wordmark-dark\" src=\"${safeUrl(kitFile('branding/neos-wordmark.svg'))}\" alt=\"Neos\" loading=\"eager\"><img class=\"neos-wordmark-light\" src=\"${safeUrl(kitFile('branding/neos-wordmark-light.svg'))}\" alt=\"Neos\" loading=\"eager\">`;}",
  'dashboard wordmark');
js = replaceOnce(js, 'NEOS 0.6.35</span>', 'NEOS 0.6.36</span>', 'footer version');
js = js.replaceAll('Neos 0.6.35 —', 'Neos 0.6.36 —');
fs.writeFileSync(jsPath, js);

const cssPath = path.join(appDir, 'css', 'app.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('/* v0.6.36:')) throw new Error('Logo styles already present');
css += `
/* v0.6.36: legible Neos wordmark in both dashboard themes */
#nova-root .neos-brand{min-width:190px;max-width:190px}
#nova-root .neos-brand-mark{width:190px}
#nova-root .neos-wordmark-light{display:none}
#nova-root.neos-light .neos-wordmark-dark{display:none}
#nova-root.neos-light .neos-wordmark-light{display:block}
@media(max-width:1160px){
  #nova-root .neos-brand{min-width:175px;max-width:175px}
  #nova-root .neos-brand-mark{width:175px}
}
@media(max-width:760px){
  #nova-root .neos-brand{min-width:150px;max-width:150px}
  #nova-root .neos-brand-mark{width:150px;height:42px}
}
`;
fs.writeFileSync(cssPath, css);

const branding = path.join(appDir, 'img', 'kit', 'branding');
fs.copyFileSync(path.join(__dirname, 'neos-wordmark-v0636-dark.svg'), path.join(branding, 'neos-wordmark.svg'));
fs.copyFileSync(path.join(__dirname, 'neos-wordmark-v0636-light.svg'), path.join(branding, 'neos-wordmark-light.svg'));

const infoPath = path.join(appDir, 'appinfo', 'info.xml');
let info = fs.readFileSync(infoPath, 'utf8');
info = replaceOnce(info, '<version>0.6.35</version>', '<version>0.6.36</version>', 'app version');
fs.writeFileSync(infoPath, info);

const changelog = path.join(appDir, 'CHANGELOG.md');
fs.writeFileSync(changelog, `## 0.6.36 — Logo du dashboard plus lisible

- Le mot-symbole NEOS remplace la signature WORKSPACE, trop petite dans la barre mobile.
- Les lettres sont agrandies et contrastées ; les variantes claire et sombre s’adaptent au thème choisi.
- Le monogramme, ses couleurs et le reste du dashboard restent identiques.
- Le nom Neos est accessible aux lecteurs d’écran dans les deux thèmes.

` + fs.readFileSync(changelog, 'utf8'));
const readme = path.join(appDir, 'README.md');
fs.writeFileSync(readme, `## Neos v0.6.36 — Logo du dashboard plus lisible

Le mot-symbole de la barre supérieure est plus lisible sur ordinateur et mobile, en thème sombre ou clair.

` + fs.readFileSync(readme, 'utf8'));
console.log('Patched Neos v0.6.36');
