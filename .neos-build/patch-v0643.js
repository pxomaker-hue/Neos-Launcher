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
if (!js.includes('NEOS 0.6.42</span>') || !js.includes('neos-logo-05-hybrid-v0641.png')) {
  throw new Error('Expected published Neos v0.6.42 source');
}
js = replaceOnce(js, 'NEOS 0.6.42</span>', 'NEOS 0.6.43</span>', 'footer version');
fs.writeFileSync(jsPath, js);

const cssPath = path.join(appDir, 'css/app.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('/* v0.6.43:')) throw new Error('Elliptical halo already present');
css += `
/* v0.6.43: elliptical edge fade and gentle breathing for the logo background */
#nova-root .neos-brand-mark{--neos-halo-min:.72;--neos-halo-max:.94;--neos-halo-expand:1.035;--neos-halo-time:11s}
#nova-root .neos-brand-mark::before{-webkit-mask-image:radial-gradient(ellipse 53% 45% at 44% 50%,#000 0%,rgba(0,0,0,.88) 30%,rgba(0,0,0,.35) 66%,transparent 100%);mask-image:radial-gradient(ellipse 53% 45% at 44% 50%,#000 0%,rgba(0,0,0,.88) 30%,rgba(0,0,0,.35) 66%,transparent 100%);transform-origin:44% 50%;animation:neos-logo-halo-breathe var(--neos-halo-time) ease-in-out infinite}
@keyframes neos-logo-halo-breathe{0%,100%{opacity:var(--neos-halo-min);transform:scale(.985)}50%{opacity:var(--neos-halo-max);transform:scale(var(--neos-halo-expand))}}
#nova-root[data-motion="subtle"] .neos-brand-mark{--neos-halo-min:.76;--neos-halo-max:.86;--neos-halo-expand:1.015;--neos-halo-time:16s}
#nova-root[data-motion="off"] .neos-brand-mark::before{animation:none;opacity:.82;transform:none}
@media(prefers-reduced-motion:reduce){
  #nova-root .neos-brand-mark::before{animation:none!important;opacity:.82!important;transform:none!important}
}
`;
fs.writeFileSync(cssPath, css);

const infoPath = path.join(appDir, 'appinfo/info.xml');
fs.writeFileSync(infoPath, replaceOnce(fs.readFileSync(infoPath, 'utf8'), '<version>0.6.42</version>', '<version>0.6.43</version>', 'app version'));
const changelog = path.join(appDir, 'CHANGELOG.md');
fs.writeFileSync(changelog, `## 0.6.43 — Fond elliptique animé du logo

- Le halo et le quadrillage s'estompent progressivement sur les bords dans une forme elliptique.
- Le fond respire très lentement sans déplacer le symbole ni le mot NEOS.
- Les réglages « Discret » et « Off » ainsi que la préférence de mouvement réduit sont respectés.
- Les fonctions et données Nextcloud restent inchangées.

` + fs.readFileSync(changelog, 'utf8'));
const readme = path.join(appDir, 'README.md');
fs.writeFileSync(readme, `## Neos v0.6.43 — Halo elliptique

Le fond du logo s'efface sur les bords et respire lentement lorsque les animations sont actives.

` + fs.readFileSync(readme, 'utf8'));
console.log('Patched Neos v0.6.43');
