# SCAS diagrams (Excalidraw)

**Machine-readable contract:** [`scripts/lib/diagram-specs.js`](../../../scripts/lib/diagram-specs.js)  
**CI harness:** `node scripts/check-diagram-assets.js`

Markdown cannot render raw `.excalidraw`. Always ship a pair:

| File | Role |
|------|------|
| `<basename>.excalidraw` | Editable Excalidraw source |
| `<basename>.svg` | What Markdown embeds (`![…](…/basename.svg)`) |

## Hand-authored (unique)

| Basename | Doc(s) |
|----------|--------|
| `scas-e2e-lab-flow` | [ARCHITECTURE.md](../../platform/ARCHITECTURE.md) |
| `scas-session-tracks` | [LAB_FLOW.md](../../product/LAB_FLOW.md) |
| `scas-threat-boundaries` | [SECURITY_THREAT_MODEL.md](../../product/SECURITY_THREAT_MODEL.md) |
| `scas-curriculum-stages` | [SUPPLY_CHAIN_ATTACKS_ZERO_TO_HERO.md](../../learning-path/SUPPLY_CHAIN_ATTACKS_ZERO_TO_HERO.md) |
| `scas-scenario-17-stage-chain` | [ZERO_TO_HERO_SCENARIO_17.md](../../scenario-guides/zero-to-hero/ZERO_TO_HERO_SCENARIO_17.md) |

Full node/edge/label needles: `diagram-specs.js`.

## Observability (23 unique zero-to-hero guides)

Each zero-to-hero guide embeds its own diagram:

- `scas-observability-scenario-01` … `scas-observability-scenario-23`
- Generator: [`scripts/generate-scenario-observability-diagrams.js`](../../../scripts/generate-scenario-observability-diagrams.js)
- Section injector: [`detection-tools/es/generate-observability-section.js`](../../../detection-tools/es/generate-observability-section.js) — embeds **SVG + Mermaid sequenceDiagram**
- Phase-2 step source: [`scenario-diagram-steps.js`](../../../detection-tools/es/scenario-diagram-steps.js)

**CI:** [`.github/workflows/diagrams.yml`](../../../.github/workflows/diagrams.yml) runs on diagram-related path changes — regenerates scenario assets, fails if they drifted, then runs `check-diagram-assets.js`. Smoke also runs the harness on every PR.

Legacy shared files `scas-observability-flow.{excalidraw,svg}` may remain as reference drafts — they are **not** in the CI embed contract.

```bash
node scripts/generate-scenario-observability-diagrams.js
node detection-tools/es/generate-observability-section.js
node scripts/check-diagram-assets.js
```

## Drawing rules (strict)

1. Embed **SVG** in Markdown — never paste Excalidraw JSON into `.md`.
2. Keep `.excalidraw` + `.svg` in sync after every edit.
3. Preserve **every** edge / `requiredLabels` needle in the spec.
4. Do **not** reintroduce Mermaid in **hand-authored** platform/curriculum docs (SVG only).
5. SVG must be **well-formed XML** — escape `&` as `&amp;`.
6. Dashed optional edges keep labels (`SCAS_ES_URL`, `SCAS_FLOCI_ENABLED`, `must not`).
7. **Scenario observability only:** keep **both** the unique Excalidraw/SVG swimlane **and** a Mermaid `sequenceDiagram` in the zero-to-hero observability section (harness-enforced).
8. Observability SVG Phases 1–5 (harness-enforced): actors; Terminal A/B; numbered Phase-2 steps with ≥40px shafts; "then" / `SCAS_ES_URL` pills in gutters (lanes before connectors); Phase 3–5 gutters ≥100px; Verify footer; `markerUnits="userSpaceOnUse"` arrowheads ≤12px.
9. Safety footnotes are fine; do not invent new attack capabilities.
