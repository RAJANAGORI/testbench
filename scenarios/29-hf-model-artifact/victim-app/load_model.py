#!/usr/bin/env python3
"""Naive hub client. This is a model of trust_remote_code / pickle-class bugs, not a gadget."""
from __future__ import annotations

import argparse
import json
import os
import urllib.request
from pathlib import Path

HUB = os.environ.get("SCAS_HUB", "http://127.0.0.1:3029")
CACHE = Path(__file__).resolve().parent / ".cache" / "acme-fast-embed"


def fetch(name: str) -> Path:
    CACHE.mkdir(parents=True, exist_ok=True)
    dest = CACHE / name
    url = f"{HUB}/models/acme/fast-embed/resolve/main/{name}"
    dest.write_bytes(urllib.request.urlopen(url, timeout=5).read())
    return dest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--trust-remote-code", action="store_true")
    args = parser.parse_args()
    cfg = json.loads(fetch("config.json").read_text(encoding="utf-8"))
    weights = json.loads(fetch("weights.json").read_text(encoding="utf-8"))
    print("loaded config", cfg.get("model_type"), "weights keys", list(weights))
    if not args.trust_remote_code:
        print("[SAFE MODE] refused remote modeling.py (pass --trust-remote-code to take the unsafe path)")
        return
    if os.environ.get("TESTBENCH_MODE") != "enabled":
        print("[SAFE MODE] Malicious behavior prevented - not in testbench")
        return
    code_path = fetch("modeling.py")
    print("exec remote modeling.py from", code_path)
    exec(compile(code_path.read_text(encoding="utf-8"), str(code_path), "exec"), {})


if __name__ == "__main__":
    main()
