#!/usr/bin/env python3
"""Rebuild the checked Neos v0.6.24 ZIP from the published v0.6.23 archive.
Fail closed on unexpected input or mismatched output; do not change the source ZIP.
"""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import base64
import hashlib
import json
import zlib

root = Path(__file__).resolve().parent.parent
source = root / "neos-nextcloud35-v0.6.23.zip"
output = root / "neos-nextcloud35-v0.6.24.zip"
diff_path = root / ".neos-build" / "neos-v0.6.24.delta.b64"
EXPECTED_OLD = "a454246232a69c9dc8c620c29281402b41642bd94d550573a0b4e48f44b802f6"
EXPECTED_NEW = "ded2b92842e94d09f292344e4b22d5af25022c8d150215c45e51fda17e152be3"

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def manifest(entries):
    digest = hashlib.sha256()
    for name in sorted(entries):
        digest.update(name.encode("utf-8") + b"\\0" + bytes.fromhex(sha(entries[name])))
    return digest.hexdigest()

def build():
    patches = json.loads(zlib.decompress(base64.b64decode(diff_path.read_text())).decode("utf-8"))
    if patches["oldManifest"] != EXPECTED_OLD or patches["newManifest"] != EXPECTED_NEW:
        raise SystemExit("Patch manifest mismatch")
    replacement_map = patches["patches"]
    with ZipFile(source) as original:
        if original.testzip() is not None:
            raise SystemExit("Invalid source ZIP")
        old = {info.filename: original.read(info.filename) for info in original.infolist() if not info.is_dir()}
        if manifest(old) != EXPECTED_OLD:
            raise SystemExit("Source v0.6.23 content does not match verified manifest")
        unknown = set(replacement_map) - set(old)
        if unknown:
            raise SystemExit("Unexpected patch paths: " + repr(unknown))
        content = {}
        for name, payload in old.items():
            if name in replacement_map:
                patch = replacement_map[name]
                if sha(payload) != patch["old"]:
                    raise SystemExit("Source file hash mismatch: " + name)
                lines = payload.decode("utf-8").splitlines(keepends=True)
                for start, end, text in sorted(patch["replacements"], key=lambda item: item[0], reverse=True):
                    if not (0 <= start <= end <= len(lines)):
                        raise SystemExit("Invalid edit bounds")
                    lines[start:end] = text.splitlines(keepends=True)
                payload = "".join(lines).encode("utf-8")
                if sha(payload) != patch["new"]:
                    raise SystemExit("Patched file hash mismatch: " + name)
            content[name] = payload
        if manifest(content) != EXPECTED_NEW:
            raise SystemExit("Target manifest mismatch: refusing to publish")
        if b"<version>0.6.24</version>" not in content["novadashboard/appinfo/info.xml"]:
            raise SystemExit("Version metadata mismatch")
        with ZipFile(output, "w") as rebuilt:
            for item in original.infolist():
                if item.is_dir():
                    continue
                info = ZipInfo(item.filename, item.date_time)
                info.compress_type = ZIP_DEFLATED
                info.external_attr = item.external_attr
                info.create_system = item.create_system
                rebuilt.writestr(info, content[item.filename], compress_type=ZIP_DEFLATED, compresslevel=6)
    with ZipFile(output) as verified:
        if verified.testzip() is not None:
            raise SystemExit("Output ZIP corrupt")
        files = {n: verified.read(n) for n in verified.namelist()}
        if manifest(files) != EXPECTED_NEW:
            raise SystemExit("Output ZIP verification failed")
    print("Neos v0.6.24 rebuilt and verified:", output)

if __name__ == "__main__":
    build()
