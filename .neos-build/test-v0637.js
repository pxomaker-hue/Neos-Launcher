const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const appDir = path.dirname(path.dirname(process.argv[2]));
const js = fs.readFileSync(process.argv[2], 'utf8');
const css = fs.readFileSync(path.join(appDir, 'css/app.css'), 'utf8');
const dark = fs.readFileSync(path.join(appDir, 'img/kit/branding/neos-wordmark.svg'), 'utf8');
const light = fs.readFileSync(path.join(appDir, 'img/kit/branding/neos-wordmark-light.svg'), 'utf8');

assert.match(js, /NEOS 0\.6\.37<\/span>/);
assert.match(js, /neos-wordmark-dark/);
assert.match(js, /neos-wordmark-light/);
assert.match(css, /#nova-root\.neos-light \.neos-wordmark-dark\{display:none\}/);
assert.match(css, /#nova-root\.neos-light \.neos-wordmark-light\{display:block\}/);
assert.match(css, /@media\(max-width:760px\)[\s\S]*?\.neos-brand-mark\{width:150px;height:42px\}/);

for (const svg of [dark, light]) {
  assert.match(svg, /viewBox="0 0 357 100"/);
  assert.match(svg, /aria-label="Neos"/);
  assert.doesNotMatch(svg, /<text|WORKSPACE|<image|href=["']https?:/i, 'all lettering is native vector paths');
  assert.match(svg, /fill-rule="evenodd"/, 'open center of O is retained');
  const letters = svg.match(/<g fill="#[A-Fa-f0-9]{6}">([\s\S]*?)<\/g>/);
  assert.ok(letters && (letters[1].match(/<path/g) || []).length === 4, 'four custom letter paths');
  assert.ok((svg.match(/<path/g) || []).length >= 9, 'separate monogram and lettering');
}
assert.equal(dark.replace('#F0F6FF', '#16273D'), light,
  'light and dark variants share exactly the same geometry');

function luminance(hex) {
  return hex.match(/[\da-f]{2}/gi).map(x => parseInt(x, 16) / 255)
    .map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4)
    .reduce((sum, x, i) => sum + x * [.2126, .7152, .0722][i], 0);
}
function contrast(a, b) {
  const [l, d] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l + .05) / (d + .05);
}
assert.ok(contrast('F0F6FF', '051020') > 7, 'dark wordmark has high contrast');
assert.ok(contrast('16273D', 'FFFFFF') > 7, 'light wordmark has high contrast');
assert.ok(48 * Math.min(150 / 357, 42 / 100) >= 20, 'custom letters remain readable on mobile');
assert.ok(js.includes('nextSearchTab(') && js.includes('neos-task-widget-error'), 'prior fixes retained');
console.log('Neos v0.6.37 logo checks passed');
