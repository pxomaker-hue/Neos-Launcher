const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const appDir = path.dirname(path.dirname(process.argv[2]));
const js = fs.readFileSync(process.argv[2], 'utf8');
const css = fs.readFileSync(path.join(appDir, 'css/app.css'), 'utf8');
const png = fs.readFileSync(path.join(appDir, 'img/kit/branding/neos-logo-approved-v0638.png'));
const original = fs.readFileSync(path.join(__dirname, 'neos-logo-generated-v0638.png'));

assert.equal(crypto.createHash('sha256').update(png).digest('hex'),
  '3c3db9b00270d3ec14d3abba00d418c77e3d3304acf53a45d0ea81d94d6c016a',
  'the approved second generated logo is copied byte for byte');
assert.deepEqual(png, original);
assert.equal(png.readUInt32BE(16), 2172);
assert.equal(png.readUInt32BE(20), 724);
assert.equal(png[25], 6, 'PNG retains its transparent alpha channel');

const start = js.indexOf('  function brandMark(){');
const end = js.indexOf('\n', start);
const brandMark = new Function('kitFile', 'safeUrl', js.slice(start, end) + '\nreturn brandMark;')(
  value => `/assets/${value}`, value => value);
const html = brandMark();
assert.match(html, /neos-logo-approved-v0638\.png/);
assert.equal((html.match(/<img /g) || []).length, 1, 'one visible logo');
assert.match(html, /alt="Neos"/);
assert.match(js, /NEOS 0\.6\.38<\/span>/);
assert.match(css, /#nova-root\.neos-light \.neos-brand-mark\{background:#0B1C2E!important/,
  'light theme keeps white wordmark readable');

const content = {left: 176, right: 2017, top: 134, bottom: 622};
for (const box of [
  {width: 205, height: 52, imageWidth: 222, imageHeight: 74, left: -10, top: -13},
  {width: 180, height: 48, imageWidth: 207, imageHeight: 69, left: -15, top: -12},
  {width: 150, height: 42, imageWidth: 174, imageHeight: 58, left: -12, top: -9},
]) {
  const x1 = box.left + content.left * box.imageWidth / 2172;
  const x2 = box.left + content.right * box.imageWidth / 2172;
  const y1 = box.top + content.top * box.imageHeight / 724;
  const y2 = box.top + content.bottom * box.imageHeight / 724;
  assert.ok(x1 >= 0 && x2 <= box.width && y1 >= 0 && y2 <= box.height,
    `logo fits ${box.width}×${box.height} header without clipping`);
  assert.ok(x2 - x1 > box.width * .85, 'transparent margins do not shrink the visible logo');
}
assert.ok(js.includes('nextSearchTab(') && js.includes('neos-task-widget-error'),
  'previous fixes retained');
console.log('Neos v0.6.38 approved logo placement checks passed');
