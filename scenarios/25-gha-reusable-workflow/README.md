# Scenario 25: compromised reusable GitHub Action

05 is "your build script got weird." 23 is Trivy: stolen PAT, force-pushed scanner tags. This lab is the third-party `uses:` line. Think `tj-actions/changed-files` in March 2025. The marketplace README said `@v1`, so that is what landed in CI.

Reusable `workflow_call` can wait. First cut is `uses: owner/action@v1`.

The runner is local. Nothing talks to `api.github.com`. No org tokens.


## Table of Contents

<div class="doc-toc">

- [Setup](#setup)
- [Run the lab](#run-the-lab)
- [What to stare at](#what-to-stare-at)
- [Mitigation Playbook](#mitigation-playbook)
- [Success](#success)
- [Related](#related)

</div>

---
## Setup

```bash
cd scenarios/25-gha-reusable-workflow
export TESTBENCH_MODE=enabled
./setup.sh
```

## Run the lab

### Terminal A

```bash
node infrastructure/mock-server.js
```

### Terminal B

```bash
export TESTBENCH_MODE=enabled
diff -u workflows/safe.yml workflows/unsafe.yml
node detection-tools/workflow-auditor.js workflows/unsafe.yml
node infrastructure/gha-runner.js workflows/unsafe.yml
curl -s http://127.0.0.1:3025/captured-data
```

Then run the safe file. The auditor should go quiet. The SHA in `workflows/safe.yml` does not move when I rewrite a `v1` tag in the story.

## What to stare at

| File | Point |
|------|--------|
| `workflows/unsafe.yml` | `pull_request_target`, `contents: write`, `@v1` |
| `workflows/safe.yml` | `pull_request`, `contents: read`, 40-char SHA |
| `actions/changed-files-like/index.js` | Payload gated on `TESTBENCH_MODE` |

## Mitigation Playbook

- Pin third-party actions to a full commit SHA, not `@v1`.
- Do not use `pull_request_target` unless you have a written reason and a locked-down token.
- Default `GITHUB_TOKEN` to least privilege (`contents: read`).
- Treat marketplace "copy this `@v1` snippet" as marketing, not policy.
- Watch action tags for force-pushes. Lab 23 is the scanner-as-payload case; this one is the generic `uses:` line.

## Success

- [ ] README contrast with 05 and 23 is not a footnote you skipped.
- [ ] Unsafe run captures on `:3025`. Safe YAML does not share those IOCs.
- [ ] You can name the three YAML IOCs without looking.

## Related

05 build compromise · 23 Trivy CI · 15 developer tools
