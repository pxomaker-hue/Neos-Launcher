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
if (!js.includes('NEOS 0.6.38</span>') || !js.includes('neos-logo-approved-v0638.png')) {
  throw new Error('Expected the published Neos v0.6.38 source');
}
js = replaceOnce(js,
  "  function brandMark(){return `<img class=\"neos-wordmark-approved\" src=\"${safeUrl(kitFile('branding/neos-logo-approved-v0638.png'))}\" alt=\"Neos\" loading=\"eager\">`;}",
  "  function brandMark(){return `<img class=\"neos-wordmark-approved\" src=\"${safeUrl(kitFile('branding/neos-logo-approved-v0638.png'))}\" alt=\"Neos\" loading=\"eager\"><span class=\"neos-logo-subtitle\">Dashboard</span>`;}",
  'dashboard logo');
js = replaceOnce(js, 'NEOS 0.6.38</span>', 'NEOS 0.6.39</span>', 'footer version');
fs.writeFileSync(jsPath, js);

const cssPath = path.join(appDir, 'css/app.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('/* v0.6.39:')) throw new Error('Logo animation already present');
css += `
/* v0.6.39: Dashboard subtitle and restrained cyber scan on the chosen logo */
#nova-root .neos-brand-mark{--neos-logo-scan-distance:72px;--neos-logo-scan-strength:.62;isolation:isolate}
#nova-root .neos-logo-subtitle{position:absolute;z-index:3;left:68px;top:42px;color:#A5D6E4;font:700 10px/9px Arial,Helvetica,sans-serif;letter-spacing:.2em;white-space:nowrap;pointer-events:none}
#nova-root .neos-brand-mark::after{content:"";position:absolute;z-index:2;top:0;left:-10px;width:11px;height:100%;background:linear-gradient(90deg,transparent,rgba(76,245,240,.82),transparent);filter:blur(1px);mix-blend-mode:screen;pointer-events:none;opacity:0;animation:neos-logo-scan 5.8s linear infinite}
@keyframes neos-logo-scan{0%,72%{transform:translateX(0);opacity:0}76%{opacity:var(--neos-logo-scan-strength)}88%{transform:translateX(var(--neos-logo-scan-distance));opacity:var(--neos-logo-scan-strength)}94%,100%{transform:translateX(var(--neos-logo-scan-distance));opacity:0}}
#nova-root[data-motion="subtle"] .neos-brand-mark{--neos-logo-scan-strength:.28}
#nova-root[data-motion="subtle"] .neos-brand-mark::after{animation-duration:9s}
#nova-root[data-motion="off"] .neos-brand-mark::after{animation:none;opacity:0}
@media(max-width:1160px){
  #nova-root .neos-brand-mark{--neos-logo-scan-distance:61px}
  #nova-root .neos-logo-subtitle{left:57px;top:39px;font-size:9px;line-height:8px}
}
@media(max-width:760px){
  #nova-root .neos-brand-mark{--neos-logo-scan-distance:52px}
  #nova-root .neos-logo-subtitle{left:49px;top:34px;font-size:8px;line-height:8px;letter-spacing:.16em}
}
@media(prefers-reduced-motion:reduce){
  #nova-root .neos-brand-mark::after{animation:none!important;opacity:0!important}
}
`;
fs.writeFileSync(cssPath, css);

const infoPath = path.join(appDir, 'appinfo/info.xml');
const info = fs.readFileSync(infoPath, 'utf8');
fs.writeFileSync(infoPath, replaceOnce(info, '<version>0.6.38</version>', '<version>0.6.39</version>', 'app version'));

const changelog = path.join(appDir, 'CHANGELOG.md');
fs.writeFileSync(changelog, `## 0.6.39 — Signature Dashboard et balayage cyber du logo

- Le deuxième logo généré reste inchangé ; « Dashboard » apparaît sous NEOS aux trois tailles de la barre.
- Un bref balayage cyan anime le symbole N sans déplacer le logo ni gêner la lecture du mot-symbole.
- L’animation est atténuée avec le réglage « Discret » et désactivée avec « Off » ou la préférence système de mouvement réduit.
- Les fonctions et données Nextcloud restent inchangées.

` + fs.readFileSync(changelog, 'utf8'));
const readme = path.join(appDir, 'README.md');
fs.writeFileSync(readme, `## Neos v0.6.39 — Logo Dashboard animé

Le logo choisi affiche le sous-titre Dashboard et un balayage cyber discret, respectueux des préférences de mouvement.

` + fs.readFileSync(readme, 'utf8'));
console.log('Patched Neos v0.6.39');
