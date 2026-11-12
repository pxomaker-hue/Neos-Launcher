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
assert.match(js, /NEOS 0\.6\.39<\/span>/);

const whiteBounds = {left: 755, right: 2016, top: 244, bottom: 526};
const layouts = [
  {boxW: 205, boxH: 52, imgW: 222, imgH: 74, imgL: -10, imgT: -13, textL: 68, textT: 42, textH: 9},
  {boxW: 180, boxH: 48, imgW: 207, imgH: 69, imgL: -15, imgT: -12, textL: 57, textT: 39, textH: 8},
  {boxW: 150, boxH: 42, imgW: 174, imgH: 58, imgL: -12, imgT: -9, textL: 49, textT: 34, textH: 8},
];
for (const layout of layouts) {
  const wordLeft = layout.imgL + whiteBounds.left * layout.imgW / 2172;
  const wordBottom = layout.imgT + whiteBounds.bottom * layout.imgH / 724;
  assert.ok(Math.abs(wordLeft - layout.textL) < 2, 'subtitle aligns with NEOS');
  assert.ok(layout.textT >= wordBottom, 'subtitle does not cover NEOS');
  assert.ok(layout.textT + layout.textH <= layout.boxH, 'subtitle fits in logo box');
}
assert.match(css, /#nova-root \.neos-logo-subtitle\{[^}]*left:68px;top:42px/);
assert.match(css, /#nova-root \.neos-logo-subtitle\{left:57px;top:39px/);
assert.match(css, /#nova-root \.neos-logo-subtitle\{left:49px;top:34px/);
assert.match(css, /@keyframes neos-logo-scan/);
assert.match(css, /#nova-root\[data-motion="subtle"\] \.neos-brand-mark::after\{animation-duration:9s\}/);
assert.match(css, /#nova-root\[data-motion="off"\] \.neos-brand-mark::after\{animation:none;opacity:0\}/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)\{\s*#nova-root \.neos-brand-mark::after\{animation:none!important;opacity:0!important\}/);
assert.match(css, /#nova-root \.neos-brand-mark::after\{[^}]*pointer-events:none/,
  'animation does not intercept clicks');
assert.ok(js.includes('nextSearchTab(') && js.includes('neos-task-widget-error'),
  'previous fixes retained');
console.log('Neos v0.6.39 Dashboard logo checks passed');
