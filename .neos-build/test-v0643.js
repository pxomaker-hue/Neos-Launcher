const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const appDir = path.dirname(path.dirname(process.argv[2]));
const js = fs.readFileSync(process.argv[2], 'utf8');
const css = fs.readFileSync(path.join(appDir, 'css/app.css'), 'utf8');
const start = js.indexOf('  function brandMark(){');
const end = js.indexOf('\n', start);
const brandMark = new Function('kitFile', 'safeUrl', js.slice(start, end) + '\nreturn brandMark;')(
  value => `/assets/${value}`, value => value);
const html = brandMark();

assert.match(html, /neos-logo-approved-v0638\.png/, 'approved image retained');
assert.match(html, /neos-logo-05-hybrid-v0641\.png/, 'chosen concept 05 symbol used');
assert.equal((html.match(/<img /g) || []).length, 2);
assert.match(html, /alt="Neos"/);
assert.match(html, /<span class="neos-logo-subtitle">Dashboard<\/span>/);
assert.match(html, /<span class="neos-symbol-crop" aria-hidden="true">/);
assert.doesNotMatch(html, /neos-logo-pulse/, 'old octagon animation removed');
assert.match(js, /NEOS 0\.6\.43<\/span>/);

const whiteBounds = {left: 755, right: 2016, top: 244, bottom: 526};
const layouts = [
  {boxW: 205, boxH: 52, imgW: 200, imgH: 67, imgL: -5, imgT: -9, textL: 65, textT: 42, textH: 9, clip: 66},
  {boxW: 180, boxH: 48, imgW: 186, imgH: 62, imgL: -9, imgT: -8, textL: 56, textT: 39, textH: 8, clip: 62},
  {boxW: 150, boxH: 42, imgW: 157, imgH: 52, imgL: -7, imgT: -6, textL: 48, textT: 34, textH: 8, clip: 52},
];
for (const layout of layouts) {
  const symbolRight = layout.imgL + 675 * layout.imgW / 2172;
  const clipLeft = layout.imgL + layout.clip;
  const wordLeft = layout.imgL + whiteBounds.left * layout.imgW / 2172;
  const wordBottom = layout.imgT + whiteBounds.bottom * layout.imgH / 724;
  assert.ok(symbolRight < clipLeft && clipLeft < wordLeft, 'clip hides old symbol without cutting NEOS');
  assert.ok(Math.abs(wordLeft - layout.textL) < 2, 'subtitle aligns with NEOS');
  assert.ok(layout.textT >= wordBottom, 'subtitle does not cover NEOS');
  assert.ok(layout.textT + layout.textH <= layout.boxH, 'subtitle fits in logo box');
}
assert.match(css, /#nova-root \.neos-brand-mark img\.neos-wordmark-approved\{clip-path:inset\(0 0 0 66px\)\}/);
assert.match(css, /#nova-root \.neos-brand-mark img\.neos-wordmark-approved\{clip-path:inset\(0 0 0 62px\)\}/);
assert.match(css, /#nova-root \.neos-brand-mark img\.neos-wordmark-approved\{clip-path:inset\(0 0 0 52px\)\}/);
assert.match(css, /@keyframes neos-symbol-five-charge/);
assert.match(css, /#nova-root\[data-motion="subtle"\] \.neos-symbol-crop img\.neos-symbol-five\{animation-duration:8s/);
assert.match(css, /#nova-root\[data-motion="off"\] \.neos-symbol-crop img\.neos-symbol-five\{animation:none\}/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\s*#nova-root \.neos-symbol-crop img\.neos-symbol-five\{animation:none!important\}/);
assert.match(css, /#nova-root \.neos-symbol-crop\{[^}]*pointer-events:none/,
  'animation does not intercept clicks');
const halo = css.match(/#nova-root \.neos-brand-mark::before\{([^}]+)\}/)?.[1];
assert.ok(halo, 'steady background layer is present');
assert.match(halo, /z-index:0;inset:0;pointer-events:none/);
assert.match(halo, /radial-gradient\(ellipse 72% 105%/, 'cyan halo');
assert.match(halo, /14px 14px,14px 14px/, 'light grid');
assert.doesNotMatch(halo, /animation:/, 'background remains visible with motion off');
assert.match(css, /#nova-root \.neos-brand-mark img\.neos-wordmark-approved\{z-index:1\}/,
  'wordmark stays above the background');
assert.match(css, /mask-image:radial-gradient\(ellipse 53% 45% at 44% 50%/,
  'elliptical mask fades before the container edges');
assert.match(css, /transparent 100%\);transform-origin:44% 50%;animation:neos-logo-halo-breathe/,
  'halo breathes slowly inside the fade');
assert.match(css, /@keyframes neos-logo-halo-breathe/);
assert.match(css, /#nova-root\[data-motion="subtle"\] \.neos-brand-mark\{--neos-halo-min:\.76;--neos-halo-max:\.86;--neos-halo-expand:1\.015;--neos-halo-time:16s\}/);
assert.match(css, /#nova-root\[data-motion="off"\] \.neos-brand-mark::before\{animation:none;opacity:\.82;transform:none\}/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\s*#nova-root \.neos-brand-mark::before\{animation:none!important;opacity:\.82!important;transform:none!important\}/);
const logo = fs.readFileSync(path.join(__dirname, 'neos-logo-05-hybrid-v0641.png'));
assert.equal(logo.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
assert.ok(js.includes('nextSearchTab(') && js.includes('neos-task-widget-error'),
  'previous fixes retained');
console.log('Neos v0.6.43 Dashboard logo checks passed');
