#!/usr/bin/env python3
"""Rebuild the checked Neos v0.6.31 ZIP from the published v0.6.30 archive.
Fail closed on unexpected input or mismatched output; do not change the source ZIP.
"""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import base64
import hashlib
import json
import zlib

root = Path(__file__).resolve().parent.parent
source = root / "archive/releases/v0.6/neos-nextcloud35-v0.6.30.zip"
output = root / "archive/releases/v0.6/neos-nextcloud35-v0.6.31.zip"
diff_path = root / ".neos-build" / "neos-v0.6.31.delta.b64"
EXPECTED_OLD = "ee3bdf2d6191d02d46367137e388939bb191e21d51cb03b8a7f400881666be9a"
EXPECTED_NEW = "ef3f76adf0adad80e18d44af20335155875542dfe1b14be28dd0ad6763b2ed02"

def sha(raw):
    return hashlib.sha256(raw).hexdigest()

def manifest(entries):
    digest = hashlib.sha256()
    for name in sorted(entries):
        digest.update(name.encode("utf-8") + b"\0" + bytes.fromhex(sha(entries[name])))
    return digest.hexdigest()

def build():
    encoded = "".join((root / ".neos-build" / ("neos-v0.6.31.delta.part" + str(i))).read_text().strip() for i in range(1, 5))
    if len(encoded) != 7096:
        raise SystemExit("Incomplete release patch")
    patches = json.loads(zlib.decompress(base64.b64decode(encoded)).decode("utf-8"))
    if patches["oldManifest"] != EXPECTED_OLD or patches["newManifest"] != EXPECTED_NEW:
        raise SystemExit("Patch manifest mismatch")
    replacement_map = patches["patches"]
    with ZipFile(source) as original:
        if original.testzip() is not None:
            raise SystemExit("Invalid source ZIP")
        old = {info.filename: original.read(info.filename) for info in original.infolist() if not info.is_dir()}
        if manifest(old) != EXPECTED_OLD:
            raise SystemExit("Source v0.6.30 content does not match verified manifest")
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
        if b"<version>0.6.31</version>" not in content["novadashboard/appinfo/info.xml"]:
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
    print("Neos v0.6.31 rebuilt and verified:", output)

if __name__ == "__main__":
    build()
