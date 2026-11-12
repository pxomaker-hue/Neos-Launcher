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
assert.equal((html.match(/<img /g) || []).length, 1);
assert.match(html, /alt="Neos"/);
assert.match(html, /<span class="neos-logo-subtitle">Dashboard<\/span>/);
assert.match(html, /<span class="neos-logo-pulse" aria-hidden="true"><svg/);
assert.equal((html.match(/class="neos-logo-wave /g) || []).length, 2, 'two energy waves');
assert.match(js, /NEOS 0\.6\.40<\/span>/);

const whiteBounds = {left: 755, right: 2016, top: 244, bottom: 526};
const layouts = [
  {boxW: 205, boxH: 52, imgW: 200, imgH: 67, imgL: -5, imgT: -9, textL: 65, textT: 42, textH: 9, oldW: 222},
  {boxW: 180, boxH: 48, imgW: 186, imgH: 62, imgL: -9, imgT: -8, textL: 56, textT: 39, textH: 8, oldW: 207},
  {boxW: 150, boxH: 42, imgW: 157, imgH: 52, imgL: -7, imgT: -6, textL: 48, textT: 34, textH: 8, oldW: 174},
];
for (const layout of layouts) {
  assert.ok(Math.abs(layout.imgW / layout.oldW - .9) < .005, 'logo shrunk by about 10%');
  const wordLeft = layout.imgL + whiteBounds.left * layout.imgW / 2172;
  const wordBottom = layout.imgT + whiteBounds.bottom * layout.imgH / 724;
  assert.ok(Math.abs(wordLeft - layout.textL) < 2, 'subtitle aligns with NEOS');
  assert.ok(layout.textT >= wordBottom, 'subtitle does not cover NEOS');
  assert.ok(layout.textT + layout.textH <= layout.boxH, 'subtitle fits in logo box');
}
assert.match(css, /#nova-root \.neos-brand-mark img\.neos-wordmark-approved\{width:200px;height:67px;left:-5px;top:-9px\}/);
assert.match(css, /#nova-root \.neos-brand-mark img\.neos-wordmark-approved\{width:186px;height:62px;left:-9px;top:-8px\}/);
assert.match(css, /#nova-root \.neos-brand-mark img\.neos-wordmark-approved\{width:157px;height:52px;left:-7px;top:-6px\}/);
assert.match(css, /@keyframes neos-logo-charge/);
assert.match(css, /@keyframes neos-logo-wave/);
assert.match(css, /#nova-root \.neos-brand-mark::after\{animation:none;opacity:0\}/, 'old scan disabled');
assert.match(css, /#nova-root\[data-motion="subtle"\] \.neos-brand-mark\{--neos-pulse-level:\.32/);
assert.match(css, /#nova-root\[data-motion="off"\] \.neos-logo-pulse\{display:none\}/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\s*#nova-root \.neos-logo-pulse\{display:none!important\}/);
assert.match(css, /#nova-root \.neos-logo-pulse\{[^}]*pointer-events:none/,
  'animation does not intercept clicks');
assert.ok(js.includes('nextSearchTab(') && js.includes('neos-task-widget-error'),
  'previous fixes retained');
console.log('Neos v0.6.40 Dashboard logo checks passed');
