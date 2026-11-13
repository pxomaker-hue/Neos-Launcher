#!/usr/bin/env python3
"""Rebuild Neos 0.6.22 from the 0.6.21 ZIP, verifying every output file."""
from pathlib import Path
import base64
import hashlib
import json
import zlib
import zipfile

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'archive/releases/v0.6/neos-nextcloud35-v0.6.21.zip'
TARGET = ROOT / 'archive/releases/v0.6/neos-nextcloud35-v0.6.22.zip'
DELTA = ROOT / '.neos-build/neos-v0.6.22.delta.b64'
OLD_SHA256 = '8179553a35508ca31bbd4b592126f60c6b0d7e4c1851db314a3e70861d045dc2'
NEW_CONTENT_SHA256 = '84dfee01d0f75e0fccb14275cba4078da137705e4d3c9da9cf6401dca529a716'

if hashlib.sha256(SOURCE.read_bytes()).hexdigest() != OLD_SHA256:
    raise SystemExit('Source ZIP does not match the verified v0.6.21 release')
patch = json.loads(zlib.decompress(base64.b64decode(DELTA.read_text())).decode('utf-8'))
with zipfile.ZipFile(SOURCE) as old, zipfile.ZipFile(TARGET, 'w') as new:
    for item in old.infolist():
        if item.is_dir():
            continue
        path = item.filename
        data = old.read(path)
        if path in patch:
            lines = data.decode('utf-8').splitlines(keepends=True)
            data = ''.join(''.join(lines[p[0]:p[1]]) if isinstance(p, list) else p for p in patch[path]).encode('utf-8')
        info = zipfile.ZipInfo(path, item.date_time)
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = item.external_attr
        new.writestr(info, data, compresslevel=6)
with zipfile.ZipFile(TARGET) as archive:
    digest = hashlib.sha256()
    for path in sorted(archive.namelist()):
        digest.update(path.encode('utf-8') + b'\0' + hashlib.sha256(archive.read(path)).digest())
    if digest.hexdigest() != NEW_CONTENT_SHA256:
        TARGET.unlink(missing_ok=True)
        raise SystemExit('Rebuilt ZIP contents do not match the validated v0.6.22')
    assert b'<version>0.6.22</version>' in archive.read('novadashboard/appinfo/info.xml')
print('Neos v0.6.22 rebuilt and verified:', TARGET)
