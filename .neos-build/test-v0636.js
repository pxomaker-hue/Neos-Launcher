const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const appDir = path.dirname(path.dirname(process.argv[2]));
const js = fs.readFileSync(process.argv[2], 'utf8');
const css = fs.readFileSync(path.join(appDir, 'css', 'app.css'), 'utf8');
const dark = fs.readFileSync(path.join(appDir, 'img/kit/branding/neos-wordmark.svg'), 'utf8');
const light = fs.readFileSync(path.join(appDir, 'img/kit/branding/neos-wordmark-light.svg'), 'utf8');

const start = js.indexOf('  function brandMark(){');
const end = js.indexOf('\n', start);
assert.ok(start > 0 && end > start, 'dashboard logo renderer present');
const brandMark = new Function('kitFile', 'safeUrl', js.slice(start, end) + '\nreturn brandMark;')(
  value => `/assets/${value}`, value => value);
const markup = brandMark();
assert.match(markup, /neos-wordmark-dark/);
assert.match(markup, /neos-wordmark-light/);
assert.equal((markup.match(/alt="Neos"/g) || []).length, 2, 'visible variant has an accessible name');
assert.match(markup, /branding\/neos-wordmark-light\.svg/);
assert.match(css, /#nova-root\.neos-light \.neos-wordmark-dark\{display:none\}/);
assert.match(css, /#nova-root\.neos-light \.neos-wordmark-light\{display:block\}/);

for (const svg of [dark, light]) {
  assert.match(svg, /viewBox="0 0 315 88"/);
  assert.match(svg, /font-size="58"/);
  assert.match(svg, />NEOS<\/text>/);
  assert.doesNotMatch(svg, /WORKSPACE/, 'tiny subtitle removed');
  assert.match(svg, /id="neos-mark-gradient"/);
}
assert.match(dark, /fill="#F0F6FF"/);
assert.match(light, /fill="#16273D"/);
const mobileScale = Math.min(150 / 315, 42 / 88);
assert.ok(58 * mobileScale > 24, 'NEOS lettering remains large on mobile');

function luminance(hex) {
  const components = hex.match(/[\da-f]{2}/gi).map(x => parseInt(x, 16) / 255);
  return components.map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4)
    .reduce((sum, x, i) => sum + x * [.2126, .7152, .0722][i], 0);
}
function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + .05) / (dark + .05);
}
assert.ok(contrast('F0F6FF', '051020') > 7, 'dark theme wordmark contrast');
assert.ok(contrast('16273D', 'FFFFFF') > 7, 'light theme wordmark contrast');
assert.ok(js.includes('nextSearchTab(') && js.includes('neos-task-widget-error'), 'prior fixes retained');

console.log('Neos v0.6.36 wordmark checks passed');
