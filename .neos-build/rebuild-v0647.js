const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '..');
const inputPath = path.join(root, 'neos-nextcloud35-v0.6.46.zip');
const outputPath = path.join(root, 'neos-nextcloud35-v0.6.47.zip');
const changed = new Set([
  'novadashboard/js/app.js',
  'novadashboard/css/app.css',
  'novadashboard/appinfo/info.xml',
  'novadashboard/CHANGELOG.md',
  'novadashboard/README.md',
]);

const crcTable = Array.from({length: 256}, (_, n) => {
  for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function readZip(bytes) {
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (bytes.readUInt32LE(i) === 0x06054b50) { end = i; break; }
  }
  if (end < 0) throw new Error('Missing ZIP directory');
  const count = bytes.readUInt16LE(end + 10);
  let offset = bytes.readUInt32LE(end + 16);
  const entries = [];
  for (let i = 0; i < count; i++) {
    if (bytes.readUInt32LE(offset) !== 0x02014b50) throw new Error('Invalid ZIP directory');
    const nameLength = bytes.readUInt16LE(offset + 28);
    const extraLength = bytes.readUInt16LE(offset + 30);
    const commentLength = bytes.readUInt16LE(offset + 32);
    const name = bytes.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');
    if (!name.startsWith('novadashboard/') || name.includes('..') || name.includes('\\')) {
      throw new Error(`Unexpected ZIP path: ${name}`);
    }
    const method = bytes.readUInt16LE(offset + 10);
    const size = bytes.readUInt32LE(offset + 20);
    const originalSize = bytes.readUInt32LE(offset + 24);
    const local = bytes.readUInt32LE(offset + 42);
    if (bytes.readUInt32LE(local) !== 0x04034b50) throw new Error('Invalid ZIP entry');
    const dataStart = local + 30 + bytes.readUInt16LE(local + 26) + bytes.readUInt16LE(local + 28);
    const compressed = bytes.subarray(dataStart, dataStart + size);
    const data = method === 8 ? zlib.inflateRawSync(compressed) : method === 0 ? compressed : null;
    if (!data || data.length !== originalSize || crc32(data) !== bytes.readUInt32LE(offset + 16)) {
      throw new Error(`Corrupt ZIP entry: ${name}`);
    }
    entries.push({name, data, time: bytes.readUInt16LE(offset + 12), date: bytes.readUInt16LE(offset + 14), external: bytes.readUInt32LE(offset + 38)});
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}
function writeZip(entries) {
  const localParts = [], centralParts = [];
  let offset = 0, centralSize = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, 'utf8');
    const compressed = zlib.deflateRawSync(entry.data, {level: 6});
    const crc = crc32(entry.data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(entry.time, 10);
    local.writeUInt16LE(entry.date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    localParts.push(local, name, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(entry.time, 12);
    central.writeUInt16LE(entry.date, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(entry.external >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);
    offset += local.length + name.length + compressed.length;
    centralSize += central.length + name.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localParts, ...centralParts, end]);
}

const original = readZip(fs.readFileSync(inputPath));
if (original.length !== 165 || !original.find(e => e.name === 'novadashboard/appinfo/info.xml')?.data.toString().includes('<version>0.6.46</version>')) {
  throw new Error('Expected a valid v0.6.46 release with 165 files');
}
const tmpRoot = path.resolve(__dirname);
const work = fs.mkdtempSync(path.join(tmpRoot, 'neos-v0647-'));
try {
  for (const entry of original.filter(e => changed.has(e.name))) {
    const target = path.join(work, entry.name);
    fs.mkdirSync(path.dirname(target), {recursive: true});
    fs.writeFileSync(target, entry.data);
  }
  const appDir = path.join(work, 'novadashboard');
  execFileSync(process.execPath, [path.join(__dirname, 'patch-v0647.js'), appDir], {stdio: 'inherit'});
  const jsPath = path.join(appDir, 'js/app.js');
  execFileSync(process.execPath, ['--check', jsPath], {stdio: 'inherit'});
  execFileSync(process.execPath, [path.join(__dirname, 'test-v0647.js'), jsPath], {stdio: 'inherit'});
  const updated = original.map(entry => changed.has(entry.name) ? {
    ...entry, data: fs.readFileSync(path.join(work, entry.name)),
  } : entry);
  const candidate = writeZip(updated);
  const verified = readZip(candidate);
  if (verified.length !== 165 || !verified.find(e => e.name === 'novadashboard/appinfo/info.xml')?.data.toString().includes('<version>0.6.47</version>')) {
    throw new Error('Invalid v0.6.47 ZIP');
  }
  fs.writeFileSync(outputPath, candidate);
  console.log(`Validated Neos v0.6.47: ${outputPath} (${verified.length} files)`);
  console.log(`SHA256: ${require('node:crypto').createHash('sha256').update(candidate).digest('hex')}`);
} finally {
  if (!path.resolve(work).startsWith(tmpRoot + path.sep)) throw new Error('Unsafe temporary directory');
  fs.rmSync(work, {recursive: true, force: true});
}
