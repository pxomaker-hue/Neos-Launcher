#!/usr/bin/env python3
"""Build Neos v0.6.33 from the exact v0.6.32 release published by Work.

Fails on missing previous-release fields, wrong versions, syntax errors and bad ZIPs.
No user Nextcloud data is accessed or modified.
"""
from pathlib import Path
import hashlib
import subprocess
import sys
import tempfile
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

root=Path(__file__).resolve().parent.parent
source=root/'neos-nextcloud35-v0.6.32.zip'
output=root/'neos-nextcloud35-v0.6.33.zip'
patch=root/'.neos-build/patch-v0633.py'
if not source.exists() or not patch.exists():
    raise SystemExit('Missing verified Work v0.6.32 ZIP or patch-v0633.py')

with tempfile.TemporaryDirectory(prefix='neos-v0633-') as work:
    work=Path(work)
    with ZipFile(source) as original:
        if original.testzip() is not None:raise SystemExit('Corrupt Work v0.6.32 release')
        infos={i.filename:i for i in original.infolist() if not i.is_dir()}
        if not 150 <= len(infos) <= 300:raise SystemExit('Unexpected ZIP file count')
        old_info=original.read('novadashboard/appinfo/info.xml')
        if b'<version>0.6.32</version>' not in old_info:raise SystemExit('Expected Work v0.6.32 input, refusing to patch')
        app_src=original.read('novadashboard/js/app.js')
        for signature in [b'canCreate=hasRight(',b'notReadBack',b'function tasksWidget(){']:
            if signature not in app_src:raise SystemExit('Work v0.6.32 source missing: '+signature.decode())
        original.extractall(work)
        subprocess.run([sys.executable,str(patch),str(work/'novadashboard'),'0.6.32'],check=True)
        new_js=(work/'novadashboard/js/app.js').read_bytes()
        for sig in [b'canCreate=hasRight(',b'notReadBack',b'homeTaskSelection()',b'data-action="home-task-open"',b'NEOS 0.6.33']:
            if sig not in new_js:raise SystemExit('Patch validation failed: '+sig.decode())
        subprocess.run(['node','--check',str(work/'novadashboard/js/app.js')],check=True)
        with ZipFile(output,'w') as release:
            for filename,old in infos.items():
                data=(work/filename).read_bytes()
                info=ZipInfo(filename,old.date_time)
                info.compress_type=ZIP_DEFLATED
                info.external_attr=old.external_attr
                info.create_system=old.create_system
                release.writestr(info,data,compresslevel=6)
    with ZipFile(output) as candidate:
        if candidate.testzip() is not None:raise SystemExit('Corrupted output ZIP')
        if set(candidate.namelist())!=set(infos):raise SystemExit('ZIP contents lost or gained files')
        if b'<version>0.6.33</version>' not in candidate.read('novadashboard/appinfo/info.xml'):
            raise SystemExit('Wrong version in output ZIP')
print('Validated Neos v0.6.33, based on Work v0.6.32:',output)
print('SHA256:',hashlib.sha256(output.read_bytes()).hexdigest())