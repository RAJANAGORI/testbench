#!/usr/bin/env python3
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parents[1] / "attacker-module"
out = Path(__file__).resolve().parent / "goproxy-store" / "example.com" / "corp" / "widget" / "@v" / "v1.2.3.zip"
out.parent.mkdir(parents=True, exist_ok=True)
prefix = "example.com/corp/widget@v1.2.3/"
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
    for p in root.rglob("*"):
        if p.is_file():
            zf.write(p, prefix + str(p.relative_to(root)))
print("wrote", out)
