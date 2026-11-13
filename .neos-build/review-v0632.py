#!/usr/bin/env python3
"""Inspect only the source differences of two already published Neos releases."""
from pathlib import Path
from zipfile import ZipFile
from difflib import unified_diff
import json,hashlib,base64,zlib
root=Path(__file__).resolve().parent.parent
with ZipFile(root/"archive/releases/v0.6/neos-nextcloud35-v0.6.31.zip") as a, ZipFile(root/"archive/releases/v0.6/neos-nextcloud35-v0.6.32.zip") as b:
    an={x.filename for x in a.infolist() if not x.is_dir()}
    bn={x.filename for x in b.infolist() if not x.is_dir()}
    changed=[path for path in sorted(an&bn) if a.read(path)!=b.read(path)]
    print("v32 changed:",changed)
    out=[]
    for path in changed:
        before=a.read(path)
        after=b.read(path)
        diff=list(unified_diff(before.decode('utf-8').splitlines(keepends=True),after.decode('utf-8').splitlines(keepends=True),fromfile="v31/"+path,tofile="v32/"+path,n=2))
        out.append("".join(diff))
    report="\n".join(["Files changed: "+", ".join(changed),"Only in v32: "+", ".join(sorted(bn-an)),"Only in v31: "+", ".join(sorted(an-bn))]+out)
    (root/".neos-build/v0632-source-diff.txt").write_text(report,encoding="utf-8")
    print("Diff chars:",len(report))
