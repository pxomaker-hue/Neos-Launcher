const fs = require('node:fs');
const path = require('node:path');

const appDir = process.argv[2];
if (!appDir) throw new Error('Application directory required');
function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first < 0 || text.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Expected exactly one ${label} anchor`);
  }
  return text.slice(0, first) + after + text.slice(first + before.length);
}

const jsPath = path.join(appDir, 'js/app.js');
let js = fs.readFileSync(jsPath, 'utf8');
if (!js.includes('NEOS 0.6.37</span>') || !js.includes('neos-wordmark-light.svg')) {
  throw new Error('Expected the published Neos v0.6.37 source');
}
js = replaceOnce(js,
  "  function brandMark(){return `<img class=\"neos-wordmark-dark\" src=\"${safeUrl(kitFile('branding/neos-wordmark.svg'))}\" alt=\"Neos\" loading=\"eager\"><img class=\"neos-wordmark-light\" src=\"${safeUrl(kitFile('branding/neos-wordmark-light.svg'))}\" alt=\"Neos\" loading=\"eager\">`;}",
  "  function brandMark(){return `<img class=\"neos-wordmark-approved\" src=\"${safeUrl(kitFile('branding/neos-logo-approved-v0638.png'))}\" alt=\"Neos\" loading=\"eager\">`;}",
  'dashboard logo');
js = replaceOnce(js, 'NEOS 0.6.37</span>', 'NEOS 0.6.38</span>', 'footer version');
fs.writeFileSync(jsPath, js);

const cssPath = path.join(appDir, 'css/app.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('/* v0.6.38:')) throw new Error('Logo placement already present');
css += `
/* v0.6.38: display the chosen generated logo with its transparent margins cropped by layout */
#nova-root .neos-brand-mark{position:relative;width:205px;height:52px;overflow:hidden}
#nova-root .neos-brand-mark img.neos-wordmark-approved{position:absolute;display:block;width:222px;height:74px;max-width:none;left:-10px;top:-13px;object-fit:fill}
#nova-root.neos-light .neos-brand-mark{background:#0B1C2E!important;border-radius:11px!important;box-shadow:inset 0 0 0 1px rgba(37,228,220,.38)!important}
@media(max-width:1160px){
  #nova-root .neos-brand-mark{width:180px;height:48px}
  #nova-root .neos-brand-mark img.neos-wordmark-approved{width:207px;height:69px;left:-15px;top:-12px}
}
@media(max-width:760px){
  #nova-root .neos-brand-mark{width:150px;height:42px}
  #nova-root .neos-brand-mark img.neos-wordmark-approved{width:174px;height:58px;left:-12px;top:-9px}
}
`;
fs.writeFileSync(cssPath, css);

const sourcePng = path.join(__dirname, 'neos-logo-generated-v0638.png');
const targetPng = path.join(appDir, 'img/kit/branding/neos-logo-approved-v0638.png');
fs.mkdirSync(path.dirname(targetPng), {recursive: true});
fs.copyFileSync(sourcePng, targetPng);

const infoPath = path.join(appDir, 'appinfo/info.xml');
const info = fs.readFileSync(infoPath, 'utf8');
fs.writeFileSync(infoPath, replaceOnce(info, '<version>0.6.37</version>', '<version>0.6.38</version>', 'app version'));

const changelog = path.join(appDir, 'CHANGELOG.md');
fs.writeFileSync(changelog, `## 0.6.38 — Logo choisi intégré fidèlement

- Le dashboard utilise exactement la deuxième image de logo NEOS choisie par l’utilisateur, sans redessin du symbole ou du lettrage.
- Son cadrage compense les marges transparentes de l’image pour remplir correctement la barre sur ordinateur et sur mobile.
- En thème clair, un fond sombre local préserve la lisibilité du mot-symbole blanc.
- Les autres éléments du dashboard et les fonctions de Neos restent inchangés.

` + fs.readFileSync(changelog, 'utf8'));
const readme = path.join(appDir, 'README.md');
fs.writeFileSync(readme, `## Neos v0.6.38 — Logo approuvé dans le dashboard

La barre supérieure affiche le deuxième logo généré choisi, avec un cadrage adapté aux tailles de fenêtre.

` + fs.readFileSync(readme, 'utf8'));
console.log('Patched Neos v0.6.38');
