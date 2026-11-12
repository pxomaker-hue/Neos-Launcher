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
if (!js.includes('NEOS 0.6.40</span>')) throw new Error('Expected published v0.6.40 source');
js = replaceOnce(js,
  '  function brandMark(){return `<img class="neos-wordmark-approved" src="${safeUrl(kitFile(\'branding/neos-logo-approved-v0638.png\'))}" alt="Neos" loading="eager"><span class="neos-logo-subtitle">Dashboard</span><span class="neos-logo-pulse" aria-hidden="true"><svg viewBox="0 0 52 50" focusable="false"><path class="neos-logo-wave neos-logo-wave-one" d="M15 2H37L50 15V35L37 48H15L2 35V15Z"/><path class="neos-logo-wave neos-logo-wave-two" d="M15 2H37L50 15V35L37 48H15L2 35V15Z"/></svg></span>`;}',
  '  function brandMark(){return `<span class="neos-symbol-crop" aria-hidden="true"><img class="neos-symbol-five" src="${safeUrl(kitFile(\'branding/neos-logo-05-hybrid-v0641.png\'))}" alt="" loading="eager"></span><img class="neos-wordmark-approved" src="${safeUrl(kitFile(\'branding/neos-logo-approved-v0638.png\'))}" alt="Neos" loading="eager"><span class="neos-logo-subtitle">Dashboard</span>`;}',
  'brand markup');
js = replaceOnce(js, 'NEOS 0.6.40</span>', 'NEOS 0.6.41</span>', 'footer version');
fs.writeFileSync(jsPath, js);

const cssPath = path.join(appDir, 'css/app.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (css.includes('/* v0.6.41:')) throw new Error('Logo composition already present');
css += `
/* v0.6.41: concept 05 symbol with the existing dashboard wordmark and layout */
#nova-root .neos-brand-mark img.neos-wordmark-approved{clip-path:inset(0 0 0 66px)}
#nova-root .neos-symbol-crop{position:absolute;left:7px;top:1px;width:54px;height:49px;overflow:hidden;z-index:2;pointer-events:none}
#nova-root .neos-symbol-crop img.neos-symbol-five{position:absolute;display:block;width:217px;height:72px;max-width:none;left:-30px;top:-11px;animation:neos-symbol-five-charge 5.4s ease-in-out infinite}
@keyframes neos-symbol-five-charge{0%,17%,56%,100%{filter:brightness(1)}30%{filter:brightness(1.28) drop-shadow(0 0 2px #58f9ec)}41%{filter:brightness(1.12) drop-shadow(0 0 1px #58f9ec)}47%{filter:brightness(1.22) drop-shadow(0 0 2px #58f9ec)}}
#nova-root[data-motion="subtle"] .neos-symbol-crop img.neos-symbol-five{animation-duration:8s;animation-name:neos-symbol-five-subtle}
@keyframes neos-symbol-five-subtle{0%,17%,56%,100%{filter:brightness(1)}30%,47%{filter:brightness(1.08)}}
#nova-root[data-motion="off"] .neos-symbol-crop img.neos-symbol-five{animation:none}
@media(max-width:1160px){
  #nova-root .neos-brand-mark img.neos-wordmark-approved{clip-path:inset(0 0 0 62px)}
  #nova-root .neos-symbol-crop{left:5px;top:1px;width:49px;height:46px}
  #nova-root .neos-symbol-crop img.neos-symbol-five{width:195px;height:65px;left:-27px;top:-10px}
}
@media(max-width:760px){
  #nova-root .neos-brand-mark img.neos-wordmark-approved{clip-path:inset(0 0 0 52px)}
  #nova-root .neos-symbol-crop{left:6px;top:2px;width:42px;height:39px}
  #nova-root .neos-symbol-crop img.neos-symbol-five{width:169px;height:56px;left:-23px;top:-8px}
}
@media(prefers-reduced-motion:reduce){
  #nova-root .neos-symbol-crop img.neos-symbol-five{animation:none!important}
}
`;
fs.writeFileSync(cssPath, css);

const infoPath = path.join(appDir, 'appinfo/info.xml');
fs.writeFileSync(infoPath, replaceOnce(fs.readFileSync(infoPath, 'utf8'), '<version>0.6.40</version>', '<version>0.6.41</version>', 'app version'));
const changelog = path.join(appDir, 'CHANGELOG.md');
fs.writeFileSync(changelog, `## 0.6.41 — Symbole 05 et signature Dashboard conservée

- Le symbole en N à quatre points de la proposition 05, avec une fine orbite inspirée de la 03, remplace le symbole de l'en-tête.
- La typographie NEOS, le sous-titre Dashboard et leur disposition de la v0.6.40 sont conservés.
- La pulsation lumineuse suit le nouveau symbole et respecte les préférences de mouvement.
- Les fonctions et données Nextcloud restent inchangées.

` + fs.readFileSync(changelog, 'utf8'));
const readme = path.join(appDir, 'README.md');
fs.writeFileSync(readme, `## Neos v0.6.41 — Symbole cyber 05 dans l'en-tête

Le nouveau N à quatre points accompagne la typographie et la disposition déjà présentes dans le dashboard.

` + fs.readFileSync(readme, 'utf8'));
console.log('Patched Neos v0.6.41');
