# Scenario 27: npm provenance bypass

21 (Axios-style) waves at "this publish did not come from GitHub OIDC" and then spends the hour on `postinstall`. 09 is sigstore / package-signing theatre with a different plot. This lab stops on the attestation.

`widget-lib@1.0.0` has a dummy in-toto statement whose issuer is `https://github.com/example/repo/.github/workflows/release.yml`. `1.0.1` has a statement that says `I typed npm publish on a laptop.` The mock on `:3027` serves both. We never call registry.npmjs.org.


## Table of Contents

<div class="doc-toc">

- [Setup](#setup)
- [Run the lab](#run-the-lab)
- [Mitigation Playbook](#mitigation-playbook)
- [Success](#success)
- [Related](#related)

</div>

---
## Setup

```bash
cd scenarios/27-npm-provenance-bypass
export TESTBENCH_MODE=enabled
./setup.sh
```

## Run the lab

```bash
export TESTBENCH_MODE=enabled
node infrastructure/mock-server.js
node infrastructure/check-provenance.js widget-lib 1.0.0
node infrastructure/check-provenance.js widget-lib 1.0.1
cd victim-app && npm start
curl -s http://127.0.0.1:3027/captured-data
```

1.0.0 should exit 0. 1.0.1 should fail the check and still run if you installed the dirty `file:` package, which `setup.sh` already did.

The JSON in `fixtures/` is clearly fake. I care about the decision (trusted-publisher vs classic token), not a perfect statement parser.

## Mitigation Playbook

- Require trusted-publisher / provenance from a known workflow issuer.
- Reject publishes whose attestation is missing or names a laptop when policy wants OIDC.
- Keep this distinct from 09 (signing) and 21 (compromised release + postinstall).
- Pin exact versions and verify the lockfile in CI.
- Alert on version bumps that do not match a GitHub Actions provenance subject.

## Success

- [ ] Three sentences ready: 27 vs 09 vs 21.
- [ ] Checker passes 1.0.0 and fails 1.0.1.
- [ ] Dirty load captures on `:3027` with the gate on.

## Related

09 package signing · 21 Axios-style npm release
