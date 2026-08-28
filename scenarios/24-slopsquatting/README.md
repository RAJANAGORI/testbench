# Scenario 24: slopsquatting

01 is a human typo (`request-lib` vs `requests-lib`). This lab is the other miss: a chat snippet invents `python-asyncio-utils` or `@stripe/react-v3`, the name never existed, and someone already planted it on a local path. Edit-distance scanners shrug. A 404 against the catalog fixture is the check that actually fires.


## Table of Contents

<div class="doc-toc">

- [What you will do](#what-you-will-do)
- [Setup](#setup)
- [Run the lab](#run-the-lab)
- [Lab tasks](#lab-tasks)
- [Mitigation Playbook](#mitigation-playbook)
- [Success](#success)
- [Related](#related)

</div>

---
## What you will do

See the fake Copilot snippet, fail the catalog lookup, then install anyway under `TESTBENCH_MODE=enabled` and watch `POST /collect` on `127.0.0.1:3024`.

## Setup

Node 16+ and npm, or Docker Compose ([DOCKER_LABS.md](../../documentation/getting-started/DOCKER_LABS.md)). One-time repo setup: `./install.sh` from the root.

```bash
cd scenarios/24-slopsquatting
export TESTBENCH_MODE=enabled
./setup.sh
```

## Run the lab

Two terminals, paths relative to `scenarios/24-slopsquatting`.

### Terminal A

```bash
node infrastructure/mock-server.js
```

### Terminal B

```bash
export TESTBENCH_MODE=enabled
cat ai-suggestion.md
node infrastructure/check-catalog.js python-asyncio-utils @stripe/react-v3 lodash
cd victim-app
npm start
```

`lodash` is 200. The other two are 404. Then `curl -s http://127.0.0.1:3024/captured-data`.

Clear between runs: `curl -X DELETE http://127.0.0.1:3024/captured-data`.

## Lab tasks

1. Read `ai-suggestion.md`. Those names are fictional. I did not scrape a live model.
2. Confirm the fixture in `infrastructure/catalog-fixture.json` has no `python-asyncio-utils`.
3. Install still works because `package.json` uses `file:`. That is the 02 trick, not a public publish.
4. Grep `node_modules/python-asyncio-utils/index.js` for `127.0.0.1` and the `TESTBENCH_MODE` gate.

## Mitigation Playbook

- Resolve every new package name against a known catalog (allowlist or registry), not edit-distance.
- Treat LLM or chat install lines as untrusted until the name exists in that catalog.
- Commit the lockfile and use `npm ci` in CI. Do not `npm install <invented-name>` from a gist.
- Prefer scoped private registries for first-party libraries.
- Check publish age and download history before adding a name nobody has seen.

## Success

- [ ] You can say out loud how 24 differs from 01.
- [ ] Catalog check 404s the hallucinated names and 200s `lodash`.
- [ ] Capture JSON lands on `:3024` only with `TESTBENCH_MODE=enabled`.

## Related

01 typosquatting · 02 dependency confusion · 20 version confusion
