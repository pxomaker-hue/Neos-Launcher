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
if (!js.includes('NEOS 0.6.39</span>') || !js.includes('neos-logo-approved-v0638.png')) {
  throw new Error('Expected the published Neos v0.6.39 source');
}
js = replaceOnce(js,
  '<span class="neos-logo-subtitle">Dashboard</span>`;}',
  '<span class="neos-logo-subtitle">Dashboard</span><span class="neos-logo-pulse" aria-hidden="true"><svg viewBox="0 0 52 50" focusable="false"><path class="neos-logo-wave neos-logo-wave-one" d="M15 2H37L50 15V35L37 48H15L2 35V15Z"/><path class="neos-logo-wave neos-logo-wave-two" d="M15 2H37L50 15V35L37 48H15L2 35V15Z"/></svg></span>`;}',
  'logo energy markup');
js = replaceOnce(js, 'NEOS 0.6.39</span>', 'NEOS 0.6.40</span>', 'footer version');
fs.writeFileSync(jsPath, js);

const cssPath = path.join(appDir, 'css/app.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('/* v0.6.40:')) throw new Error('Energy pulse already present');
css += `
/* v0.6.40: 10% smaller approved logo and a double energy pulse around its N */
#nova-root .neos-brand-mark img.neos-wordmark-approved{width:200px;height:67px;left:-5px;top:-9px}
#nova-root .neos-logo-subtitle{left:65px}
#nova-root .neos-brand-mark::after{animation:none;opacity:0}
#nova-root .neos-brand-mark{--neos-pulse-level:.82;--neos-pulse-soft:.35;--neos-pulse-mid:.5;--neos-pulse-duration:5.4s}
#nova-root .neos-logo-pulse{position:absolute;z-index:2;inset:0;pointer-events:none}
#nova-root .neos-logo-pulse::before{content:"";position:absolute;left:1px;top:-3px;width:66px;height:58px;background:radial-gradient(ellipse at center,rgba(103,255,248,.48) 0%,rgba(0,204,235,.2) 36%,transparent 72%);filter:blur(4px);mix-blend-mode:screen;opacity:0;transform:scale(.83);animation:neos-logo-charge var(--neos-pulse-duration) ease-in-out infinite}
#nova-root .neos-logo-pulse svg{position:absolute;left:7px;top:1px;width:53px;height:50px;overflow:visible;fill:none;stroke:#67fff3;stroke-width:1.25;vector-effect:non-scaling-stroke}
#nova-root .neos-logo-wave{transform-box:fill-box;transform-origin:center;opacity:0;filter:drop-shadow(0 0 3px #4bf8ec);animation:neos-logo-wave var(--neos-pulse-duration) ease-out infinite}
#nova-root .neos-logo-wave-two{animation-delay:.24s;stroke:#a7fff7;stroke-width:.8}
@keyframes neos-logo-charge{0%,14%,55%,100%{opacity:0;transform:scale(.83)}25%{opacity:var(--neos-pulse-soft);transform:scale(1)}31%{opacity:var(--neos-pulse-level);transform:scale(1.12)}38%{opacity:var(--neos-pulse-soft);transform:scale(1.03)}44%{opacity:var(--neos-pulse-mid);transform:scale(1.13)}}
@keyframes neos-logo-wave{0%,17%,57%,100%{opacity:0;transform:scale(.9)}24%{opacity:var(--neos-pulse-soft);transform:scale(.96)}31%{opacity:var(--neos-pulse-level);transform:scale(1.01)}45%{opacity:var(--neos-pulse-mid);transform:scale(1.16)}54%{opacity:0;transform:scale(1.25)}}
#nova-root[data-motion="subtle"] .neos-brand-mark{--neos-pulse-level:.32;--neos-pulse-soft:.14;--neos-pulse-mid:.2;--neos-pulse-duration:8s}
#nova-root[data-motion="off"] .neos-logo-pulse{display:none}
@media(max-width:1160px){
  #nova-root .neos-brand-mark img.neos-wordmark-approved{width:186px;height:62px;left:-9px;top:-8px}
  #nova-root .neos-logo-subtitle{left:56px}
  #nova-root .neos-logo-pulse{transform:translateX(-4px) scale(.94);transform-origin:12px 18px}
}
@media(max-width:760px){
  #nova-root .neos-brand-mark img.neos-wordmark-approved{width:157px;height:52px;left:-7px;top:-6px}
  #nova-root .neos-logo-subtitle{left:48px}
  #nova-root .neos-logo-pulse{transform:translateX(-4px) scale(.8);transform-origin:12px 18px}
}
@media(prefers-reduced-motion:reduce){
  #nova-root .neos-logo-pulse{display:none!important}
}
`;
fs.writeFileSync(cssPath, css);

const infoPath = path.join(appDir, 'appinfo/info.xml');
fs.writeFileSync(infoPath, replaceOnce(fs.readFileSync(infoPath, 'utf8'), '<version>0.6.39</version>', '<version>0.6.40</version>', 'app version'));
const changelog = path.join(appDir, 'CHANGELOG.md');
fs.writeFileSync(changelog, `## 0.6.40 — Logo plus compact et pulsation énergétique

- Le logo généré choisi est réduit d'environ 10 %, avec Dashboard toujours aligné sous NEOS.
- Le balayage est remplacé par une charge lumineuse et deux ondes cyan autour du symbole N.
- La pulsation est atténuée avec « Discret » et désactivée avec « Off » ou la préférence système de mouvement réduit.
- Les fonctions et données Nextcloud restent inchangées.

` + fs.readFileSync(changelog, 'utf8'));
const readme = path.join(appDir, 'README.md');
fs.writeFileSync(readme, `## Neos v0.6.40 — Signature Dashboard énergisée

Le logo choisi est environ 10 % plus petit. Une double pulsation cyan anime le symbole N selon les préférences de mouvement.

` + fs.readFileSync(readme, 'utf8'));
console.log('Patched Neos v0.6.40');
