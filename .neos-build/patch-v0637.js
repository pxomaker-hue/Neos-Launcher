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
const jsPath = path.join(appDir, 'js', 'app.js');
let js = fs.readFileSync(jsPath, 'utf8');
if (!js.includes('NEOS 0.6.36</span>') || !js.includes('neos-wordmark-light.svg')) {
  throw new Error('Expected the published Neos v0.6.36 source');
}
js = replaceOnce(js, 'NEOS 0.6.36</span>', 'NEOS 0.6.37</span>', 'footer version');
fs.writeFileSync(jsPath, js);

const cssPath = path.join(appDir, 'css', 'app.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('/* v0.6.37:')) throw new Error('Logo sizing already present');
css += `
/* v0.6.37: custom cyber wordmark sized for the dashboard header */
#nova-root .neos-brand{min-width:205px;max-width:205px}
#nova-root .neos-brand-mark{width:205px;height:52px}
@media(max-width:1160px){
  #nova-root .neos-brand{min-width:180px;max-width:180px}
  #nova-root .neos-brand-mark{width:180px;height:48px}
}
@media(max-width:760px){
  #nova-root .neos-brand{min-width:150px;max-width:150px}
  #nova-root .neos-brand-mark{width:150px;height:42px}
}
`;
fs.writeFileSync(cssPath, css);

const branding = path.join(appDir, 'img', 'kit', 'branding');
fs.copyFileSync(path.join(__dirname, 'neos-wordmark-v0637-dark.svg'), path.join(branding, 'neos-wordmark.svg'));
fs.copyFileSync(path.join(__dirname, 'neos-wordmark-v0637-light.svg'), path.join(branding, 'neos-wordmark-light.svg'));

const infoPath = path.join(appDir, 'appinfo', 'info.xml');
const info = fs.readFileSync(infoPath, 'utf8');
fs.writeFileSync(infoPath, replaceOnce(info, '<version>0.6.36</version>', '<version>0.6.37</version>', 'app version'));

const changelog = path.join(appDir, 'CHANGELOG.md');
fs.writeFileSync(changelog, `## 0.6.37 — Identité NEOS cyber originale

- Nouveau logo de dashboard : monogramme N angulaire inscrit dans un cadre polygonal et lettrage NEOS construit sur la même géométrie.
- Le dessin est un SVG net, sans artefacts de l’image de conception, et conserve deux variantes contrastées pour les thèmes sombre et clair.
- Dimensions adaptées à la barre du dashboard sur ordinateur et sur mobile.
- Les fonctions de Neos et les autres icônes restent inchangées.

` + fs.readFileSync(changelog, 'utf8'));
const readme = path.join(appDir, 'README.md');
fs.writeFileSync(readme, `## Neos v0.6.37 — Nouveau logo cyber du dashboard

Le logo de la barre supérieure associe un monogramme N angulaire à un lettrage NEOS original. Deux SVG adaptés aux thèmes sombre et clair garantissent sa lisibilité.

` + fs.readFileSync(readme, 'utf8'));
console.log('Patched Neos v0.6.37');
