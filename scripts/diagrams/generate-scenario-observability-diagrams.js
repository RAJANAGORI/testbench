#!/usr/bin/env node
'use strict';

/**
 * Generate detailed per-scenario observability diagrams.
 *
 * Reads scenario-observability.json + scenario-diagram-steps.js
 * Writes scas-observability-scenario-NN.{excalidraw,svg}
 *
 *   node scripts/diagrams/generate-scenario-observability-diagrams.js
 */

const fs = require('fs');
const path = require('path');
const { SCENARIO_DIAGRAMS } = require('../../detection-tools/es/scenario-diagram-steps');

const ROOT = path.resolve(__dirname, '../..');
const { diagramAssetPaths } = require('../lib/diagram-paths');
const META = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'detection-tools/es/scenario-observability.json'), 'utf8')
);

const C = {
  learner: { fill: '#dbeafe', stroke: '#2563eb', soft: '#eff6ff' },
  victim: { fill: '#ffedd5', stroke: '#ea580c', soft: '#fff7ed' },
  mal: { fill: '#fee2e2', stroke: '#dc2626', soft: '#fef2f2' },
  mock: { fill: '#dcfce7', stroke: '#16a34a', soft: '#f0fdf4' },
  es: { fill: '#e0f2fe', stroke: '#0284c7', soft: '#f0f9ff' },
  kibana: { fill: '#e0e7ff', stroke: '#4338ca', soft: '#eef2ff' },
  ink: '#0f172a',
  muted: '#64748b',
  line: '#334155',
  lane: '#f8fafc',
  laneStroke: '#cbd5e1',
  white: '#ffffff',
};

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapLines(text, maxChars) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

function shortLabel(label) {
  return String(label).split(' (')[0].trim();
}

function portFromMock(mockLabel) {
  const m = String(mockLabel).match(/:(\d{4})/);
  return m ? m[1] : '3000';
}

function captureHint(scenario) {
  const ep = scenario.mock_endpoint || 'POST /collect';
  if (/beacon/i.test(ep)) return 'infrastructure/ captured beacon JSON';
  if (/credential/i.test(scenario.mock_label || '')) return 'captured-credentials.json';
  return 'infrastructure/captured-data.json';
}

function actorColor(key) {
  if (key === 'Learner' || key === 'you') return C.learner;
  if (key === 'Victim') return C.victim;
  if (key === 'MalPkg' || key === 'C2') return C.mal;
  if (key === 'Mock') return C.mock;
  if (key === 'ES') return C.es;
  if (key === 'Kibana') return C.kibana;
  return { fill: '#f1f5f9', stroke: '#64748b', soft: '#f8fafc' };
}

function uid(prefix, n) {
  return `${prefix}-${String(n).padStart(4, '0')}`;
}

function baseEl(extra) {
  return {
    angle: 0,
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: { type: 3 },
    seed: 1,
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    ...extra,
  };
}

function makeRect(id, x, y, w, h, stroke, fill) {
  return baseEl({
    type: 'rectangle',
    id,
    x,
    y,
    width: w,
    height: h,
    strokeColor: stroke,
    backgroundColor: fill,
  });
}

function makeText(id, x, y, w, h, text, opts = {}) {
  return baseEl({
    type: 'text',
    id,
    x,
    y,
    width: w,
    height: h,
    strokeColor: opts.strokeColor || C.ink,
    backgroundColor: 'transparent',
    strokeWidth: 1,
    roundness: null,
    text,
    fontSize: opts.fontSize || 14,
    fontFamily: 1,
    textAlign: opts.textAlign || 'left',
    verticalAlign: 'top',
    containerId: null,
    originalText: text,
    lineHeight: 1.25,
    autoResize: true,
  });
}

function makeArrow(id, x, y, points, opts = {}) {
  const end = points[points.length - 1];
  return baseEl({
    type: 'arrow',
    id,
    x,
    y,
    width: end[0],
    height: end[1],
    strokeColor: opts.strokeColor || C.line,
    backgroundColor: 'transparent',
    strokeStyle: opts.dashed ? 'dashed' : 'solid',
    roundness: { type: 2 },
    points,
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: 'arrow',
  });
}

function buildExcalidraw(scenario, diagramMeta) {
  const id = scenario.scenario_id;
  const steps = diagramMeta.attack_steps || [];
  const elements = [];
  let n = 0;
  const next = (k) => uid(`${k}${id}`, ++n);

  elements.push(
    makeText(next('t'), 24, 16, 980, 28, `Scenario ${id} — ${scenario.title}`, { fontSize: 22 })
  );
  elements.push(
    makeText(
      next('t'),
      24,
      48,
      1000,
      48,
      wrapLines(diagramMeta.intro || scenario.trigger_action, 108).join('\n'),
      { fontSize: 13, strokeColor: C.muted }
    )
  );

  const actors = [
    ['Learner (you)', C.learner],
    [shortLabel(scenario.victim_label), C.victim],
    [shortLabel(scenario.malicious_label), C.mal],
    [shortLabel(scenario.mock_label), C.mock],
    ['Elasticsearch :9200', C.es],
    ['Kibana :5601', C.kibana],
  ];
  actors.forEach(([label, c], i) => {
    const x = 24 + i * 178;
    elements.push(makeRect(next('r'), x, 108, 166, 58, c.stroke, c.fill));
    elements.push(
      makeText(next('t'), x + 8, 120, 150, 40, wrapLines(label, 16).join('\n'), {
        fontSize: 12,
        textAlign: 'center',
      })
    );
  });

  let y = 190;
  // Phase lanes as stacked detailed cards
  elements.push(makeRect(next('r'), 24, y, 340, 120, C.laneStroke, C.lane));
  elements.push(
    makeText(
      next('t'),
      36,
      y + 12,
      316,
      96,
      [
        'Phase 1 — Collectors (Terminal A)',
        `cd scenarios/${scenario.folder}`,
        'export TESTBENCH_MODE=enabled',
        'export SCAS_ES_URL=… (optional)',
        scenario.mock_start,
      ].join('\n'),
      { fontSize: 12 }
    )
  );

  elements.push(makeRect(next('r'), 384, y, 660, 120, C.victim.stroke, C.victim.soft));
  elements.push(
    makeText(
      next('t'),
      396,
      y + 12,
      636,
      96,
      [
        'Phase 2 — Lab execution (Terminal B) — scenario-specific',
        ...steps.slice(0, 4).map((s, i) => `${i + 1}. ${s.from} → ${s.to}: ${s.message}`.slice(0, 78)),
      ].join('\n'),
      { fontSize: 12 }
    )
  );

  y += 140;
  elements.push(makeRect(next('r'), 24, y, 340, 110, C.mock.stroke, C.mock.soft));
  elements.push(
    makeText(
      next('t'),
      36,
      y + 12,
      316,
      86,
      [
        'Phase 3 — Exfiltration (127.0.0.1 only)',
        `MalPkg → Mock ${scenario.mock_endpoint}`,
        `Write ${captureHint(scenario)}`,
        'Gated by TESTBENCH_MODE=enabled',
      ].join('\n'),
      { fontSize: 12 }
    )
  );

  elements.push(makeRect(next('r'), 384, y, 320, 110, C.es.stroke, C.es.soft));
  elements.push(
    makeText(
      next('t'),
      396,
      y + 12,
      296,
      86,
      [
        'Phase 4 — Optional Elasticsearch',
        'If SCAS_ES_URL set:',
        'POST scas-detections',
        `Else: file-only · scas-rules/_doc/${id}`,
      ].join('\n'),
      { fontSize: 12 }
    )
  );

  elements.push(makeRect(next('r'), 724, y, 320, 110, C.kibana.stroke, C.kibana.soft));
  elements.push(
    makeText(
      next('t'),
      736,
      y + 12,
      296,
      86,
      [
        'Phase 5 — Blue-team review',
        `SCAS Detections ${id}`,
        `SCAS Rules ${id}`,
        'Correlate IOCs / Sigma / YARA',
      ].join('\n'),
      { fontSize: 12 }
    )
  );

  elements.push(
    makeArrow(next('a'), 364, 250, [
      [0, 0],
      [20, 0],
    ])
  );
  elements.push(
    makeArrow(next('a'), 364, y + 55, [
      [0, 0],
      [20, 0],
    ], { dashed: true, strokeColor: C.muted })
  );
  elements.push(
    makeArrow(next('a'), 704, y + 55, [
      [0, 0],
      [20, 0],
    ])
  );

  y += 130;
  elements.push(
    makeText(
      next('t'),
      24,
      y,
      1000,
      40,
      `Verify: ${scenario.verify_cli}\nSafety: localhost / 127.0.0.1 only · TESTBENCH_MODE=enabled · educational test bench`,
      { fontSize: 12, strokeColor: C.muted }
    )
  );

  return {
    type: 'excalidraw',
    version: 2,
    source: 'https://excalidraw.com',
    elements,
    appState: { gridSize: null, viewBackgroundColor: C.white },
    files: {},
  };
}

function buildSvg(scenario, diagramMeta) {
  const id = scenario.scenario_id;
  const steps = diagramMeta.attack_steps || [];
  const intro = diagramMeta.intro || scenario.trigger_action;
  const introLines = wrapLines(intro, 118);
  const port = portFromMock(scenario.mock_label);
  const W = 1180;

  // Long shafts between step cards; tiny fixed-size heads (userSpaceOnUse).
  const stepCardH = 56;
  const stepGap = 48;
  const phase2Inner = Math.max(1, steps.length) * stepCardH + Math.max(0, steps.length - 1) * stepGap + 48;
  const headerH = 88 + introLines.length * 16;
  const actorsH = 100;
  const phase1H = 150;
  const phase2H = Math.max(phase1H, phase2Inner + 36);
  const row1H = Math.max(phase1H, phase2H) + 24;
  const phase345H = 168;
  const verifyH = 88;
  const footerH = 56;
  const H = headerH + actorsH + row1H + phase345H + verifyH + footerH + 24;

  const parts = [];
  const push = (s) => parts.push(s);

  /** Long thin shaft + small fixed head; label on a white pill (never clipped). */
  function pushFlowArrow(x1, y1, x2, y2, opts = {}) {
    const dashed = Boolean(opts.dashed);
    const cls = dashed ? 'arrow-opt' : 'arrow';
    const x1r = Math.round(x1);
    const y1r = Math.round(y1);
    const x2r = Math.round(x2);
    const y2r = Math.round(y2);
    push(`<path class="${cls}" d="M${x1r} ${y1r} L${x2r} ${y2r}"/>`);
    if (opts.label) {
      const mx = Math.round((x1 + x2) / 2);
      const my = Math.round((y1 + y2) / 2);
      const horizontal = Math.abs(x2 - x1) >= Math.abs(y2 - y1);
      const label = String(opts.label);
      // Generous width so monospace-ish labels like SCAS_ES_URL never truncate.
      const pillW = Math.max(52, Math.ceil(label.length * 8.6) + 20);
      const pillH = 22;
      let lx = horizontal ? mx - pillW / 2 : mx + 10;
      let ly = horizontal ? my - pillH - 8 : my - pillH / 2;
      // Keep pill inside the gutter between boxes when possible.
      if (horizontal) {
        const gutterLeft = Math.min(x1, x2);
        const gutterRight = Math.max(x1, x2);
        const maxW = Math.max(40, gutterRight - gutterLeft - 4);
        const useW = Math.min(pillW, maxW);
        lx = mx - useW / 2;
        // If still wider than gutter, park above center anyway with full width
        // (gutter is widened in layout); prefer full readable label.
        if (pillW <= maxW + 8) {
          push(
            `<rect class="edge-pill" x="${Math.round(lx)}" y="${Math.round(ly)}" width="${Math.round(useW)}" height="${pillH}" rx="11"/>`
          );
          push(
            `<text class="edge-label" x="${mx}" y="${Math.round(ly + 15)}" text-anchor="middle">${esc(label)}</text>`
          );
          return;
        }
      }
      push(
        `<rect class="edge-pill" x="${Math.round(lx)}" y="${Math.round(ly)}" width="${Math.round(pillW)}" height="${pillH}" rx="11"/>`
      );
      push(
        `<text class="edge-label" x="${Math.round(lx + pillW / 2)}" y="${Math.round(ly + 15)}" text-anchor="middle">${esc(label)}</text>`
      );
    }
  }

  push(`<?xml version="1.0" encoding="UTF-8"?>`);
  push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Scenario ${id} detailed observability flow">`
  );
  push(`<style>
  .title { font-family: 'Segoe UI', system-ui, sans-serif; font-weight: 700; fill: ${C.ink}; font-size: 20px; }
  .badge { font-family: 'Segoe UI', system-ui, sans-serif; font-weight: 700; fill: #ffffff; font-size: 12px; }
  .caption { font-family: 'Segoe UI', system-ui, sans-serif; fill: ${C.muted}; font-size: 12.5px; }
  .phase { font-family: 'Segoe UI', system-ui, sans-serif; font-size: 11px; font-weight: 700; fill: ${C.muted}; letter-spacing: 0.04em; text-transform: uppercase; }
  .label { font-family: 'Segoe UI', system-ui, sans-serif; font-weight: 600; fill: ${C.ink}; font-size: 12.5px; }
  .small { font-family: 'Segoe UI', system-ui, sans-serif; fill: #334155; font-size: 11.5px; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; fill: #1e293b; font-size: 11px; }
  .chip { font-family: 'Segoe UI', system-ui, sans-serif; font-weight: 700; font-size: 10px; fill: #ffffff; }
  .edge-pill { fill: #ffffff; stroke: #94a3b8; stroke-width: 1; }
  .edge-label { font-family: 'Segoe UI', system-ui, sans-serif; fill: #0f172a; font-size: 12px; font-weight: 700; }
  .box { stroke-width: 2; stroke-linejoin: round; }
  .lane { fill: ${C.lane}; stroke: ${C.laneStroke}; stroke-width: 1.5; }
  .arrow { stroke: ${C.line}; stroke-width: 1.75; fill: none; marker-end: url(#arrowhead); stroke-linecap: round; }
  .arrow-opt { stroke: ${C.muted}; stroke-width: 1.75; fill: none; stroke-dasharray: 5 4; marker-end: url(#arrowhead-muted); stroke-linecap: round; }
</style>`);
  push(`<defs>
  <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
    <path d="M1,1.2 L7,4 L1,6.8 z" fill="${C.line}"/>
  </marker>
  <marker id="arrowhead-muted" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
    <path d="M1,1.2 L7,4 L1,6.8 z" fill="${C.muted}"/>
  </marker>
  <filter id="soft" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-opacity="0.10"/></filter>
</defs>`);
  push(`<rect width="${W}" height="${H}" fill="${C.white}"/>`);


  // Header badge + title
  push(`<rect x="24" y="18" width="72" height="28" rx="8" fill="${C.learner.stroke}"/>`);
  push(`<text class="badge" x="60" y="37" text-anchor="middle">SC ${esc(id)}</text>`);
  push(`<text class="title" x="108" y="38">Scenario ${esc(id)} — ${esc(scenario.title)}</text>`);
  push(
    `<text class="caption" x="108" y="58">Folder: scenarios/${esc(scenario.folder)} · Trigger: ${esc(scenario.trigger_action)} · Mock :${esc(port)}</text>`
  );
  introLines.forEach((line, i) => {
    push(`<text class="caption" x="24" y="${78 + i * 16}">${esc(line)}</text>`);
  });

  let y = headerH;

  // Actors strip
  push(`<text class="phase" x="24" y="${y}">Actors (this lab)</text>`);
  y += 12;
  const actors = [
    { title: 'Learner (you)', sub: 'Terminal A + B operator', c: C.learner },
    {
      title: shortLabel(scenario.victim_label),
      sub: scenario.victim_label.includes('(')
        ? scenario.victim_label.replace(/^[^()]+\(([^)]+)\).*$/, '$1')
        : 'victim runtime',
      c: C.victim,
    },
    {
      title: shortLabel(scenario.malicious_label),
      sub: 'Malicious package',
      c: C.mal,
    },
    {
      title: shortLabel(scenario.mock_label),
      sub: `${scenario.mock_endpoint} · :${port}`,
      c: C.mock,
    },
    { title: 'Elasticsearch :9200', sub: 'scas-detections / scas-rules', c: C.es },
    { title: 'Kibana :5601', sub: 'Discover saved searches', c: C.kibana },
  ];
  const aw = 178;
  actors.forEach((a, i) => {
    const x = 24 + i * (aw + 12);
    push(
      `<rect class="box" x="${x}" y="${y}" width="${aw}" height="64" rx="12" fill="${a.c.fill}" stroke="${a.c.stroke}" filter="url(#soft)"/>`
    );
    wrapLines(a.title, 18).forEach((line, li) => {
      push(
        `<text class="label" x="${x + aw / 2}" y="${y + 22 + li * 14}" text-anchor="middle">${esc(line)}</text>`
      );
    });
    push(
      `<text class="caption" x="${x + aw / 2}" y="${y + 54}" text-anchor="middle">${esc(a.sub).slice(0, 28)}</text>`
    );
  });
  y += actorsH - 8;

  // Row: Phase 1 | Phase 2
  const rowTop = y;
  const p1W = 340;
  const p2X = 420;
  const p2W = W - p2X - 24;

  push(`<rect class="lane" x="24" y="${rowTop}" width="${p1W}" height="${row1H - 16}" rx="14"/>`);
  push(`<text class="phase" x="40" y="${rowTop + 24}">Phase 1 — Collectors (Terminal A)</text>`);
  push(
    `<rect class="box" x="40" y="${rowTop + 38}" width="${p1W - 32}" height="100" rx="10" fill="${C.learner.fill}" stroke="${C.learner.stroke}" filter="url(#soft)"/>`
  );
  push(`<text class="label" x="56" y="${rowTop + 58}">Boot the localhost collector</text>`);
  push(`<text class="mono" x="56" y="${rowTop + 78}">cd scenarios/${esc(scenario.folder)}</text>`);
  push(`<text class="mono" x="56" y="${rowTop + 94}">export TESTBENCH_MODE=enabled</text>`);
  push(`<text class="mono" x="56" y="${rowTop + 110}">export SCAS_ES_URL=http://localhost:9200  # optional</text>`);
  push(`<text class="mono" x="56" y="${rowTop + 126}">${esc(scenario.mock_start)}</text>`);

  push(`<rect class="lane" x="${p2X}" y="${rowTop}" width="${p2W}" height="${row1H - 16}" rx="14"/>`);
  push(
    `<text class="phase" x="${p2X + 16}" y="${rowTop + 24}">Phase 2 — Lab execution (Terminal B) · scenario-specific</text>`
  );

  steps.forEach((step, i) => {
    const sy = rowTop + 40 + i * (stepCardH + stepGap);
    const fromC = actorColor(step.from);
    const toC = actorColor(step.to);
    push(
      `<rect class="box" x="${p2X + 16}" y="${sy}" width="${p2W - 32}" height="${stepCardH}" rx="10" fill="${C.victim.soft}" stroke="${C.victim.stroke}" filter="url(#soft)"/>`
    );
    // step number
    push(
      `<circle cx="${p2X + 40}" cy="${sy + stepCardH / 2}" r="12" fill="${C.victim.stroke}"/>`
    );
    push(
      `<text class="badge" x="${p2X + 40}" y="${sy + stepCardH / 2 + 4}" text-anchor="middle">${i + 1}</text>`
    );
    // from/to chips
    push(
      `<rect x="${p2X + 62}" y="${sy + 8}" width="78" height="18" rx="6" fill="${fromC.stroke}"/>`
    );
    push(`<text class="chip" x="${p2X + 101}" y="${sy + 21}" text-anchor="middle">${esc(step.from)}</text>`);
    push(`<text class="small" x="${p2X + 148}" y="${sy + 21}">→</text>`);
    push(
      `<rect x="${p2X + 164}" y="${sy + 8}" width="78" height="18" rx="6" fill="${toC.stroke}"/>`
    );
    push(`<text class="chip" x="${p2X + 203}" y="${sy + 21}" text-anchor="middle">${esc(step.to)}</text>`);
    const msgLines = wrapLines(step.message, 78);
    msgLines.slice(0, 2).forEach((line, li) => {
      push(`<text class="mono" x="${p2X + 62}" y="${sy + 36 + li * 13}">${esc(line)}</text>`);
    });
    if (i < steps.length - 1) {
      const ax = p2X + p2W / 2;
      pushFlowArrow(ax, sy + stepCardH, ax, sy + stepCardH + stepGap);
    }
  });

  // Phase 1 → Phase 2 (solid, labeled)
  pushFlowArrow(24 + p1W, rowTop + 80, p2X, rowTop + 80, { label: 'then' });

  y = rowTop + row1H;

  // Phase 3 / 4 / 5 — gutter must fit the SCAS_ES_URL pill (~118px) with shaft visible
  const colGap = 128;
  const colW = (W - 48 - 2 * colGap) / 3;
  const cols = [
    {
      title: 'Phase 3 — Exfiltration (127.0.0.1 only)',
      c: C.mock,
      lines: [
        `Malicious package → Mock`,
        `${scenario.mock_endpoint} JSON payload`,
        `Append ${captureHint(scenario)}`,
        'Gated by TESTBENCH_MODE=enabled',
        'No off-box C2 — localhost only',
      ],
    },
    {
      title: 'Phase 4 — Optional Elasticsearch',
      c: C.es,
      lines: [
        'If SCAS_ES_URL is set in Terminal A:',
        'Mock → POST scas-detections',
        `scenario_id=${id} · event_type=exfil_capture`,
        `Else: file-only capture (default)`,
        `Runbook pre-seeded: scas-rules/_doc/${id}`,
      ],
    },
    {
      title: 'Phase 5 — Blue-team review (Kibana)',
      c: C.kibana,
      lines: [
        'Open http://localhost:5601',
        `Discover → SCAS Detections ${id}`,
        `Discover → SCAS Rules ${id}`,
        'Compare capture fields ↔ IOCs',
        'Sigma / YARA / sample logs',
      ],
    },
  ];

  // Draw all lanes first, then connectors on top — otherwise later lane fills
  // cover the SCAS_ES_URL pill and clip the text visually.
  const phase345Connectors = [];
  cols.forEach((col, i) => {
    const x = 24 + i * (colW + colGap);
    const xR = Math.round(x);
    const colWR = Math.round(colW);
    push(`<rect class="lane" x="${xR}" y="${y}" width="${colWR}" height="${phase345H - 16}" rx="14"/>`);
    push(`<text class="phase" x="${xR + 16}" y="${y + 24}">${esc(col.title)}</text>`);
    push(
      `<rect class="box" x="${xR + 14}" y="${y + 36}" width="${colWR - 28}" height="108" rx="10" fill="${col.c.fill}" stroke="${col.c.stroke}" filter="url(#soft)"/>`
    );
    col.lines.forEach((line, li) => {
      push(`<text class="small" x="${xR + 28}" y="${y + 56 + li * 18}">${esc(line)}</text>`);
    });
    if (i < 2) {
      // Phase 3 → 4 optional (SCAS_ES_URL); Phase 4 → 5 solid.
      phase345Connectors.push({
        ax1: xR + colWR,
        ax2: xR + colWR + colGap,
        dashed: i === 0,
        label: i === 0 ? 'SCAS_ES_URL' : undefined,
      });
    }
  });
  phase345Connectors.forEach((c) => {
    pushFlowArrow(c.ax1, y + 90, c.ax2, y + 90, {
      dashed: c.dashed,
      label: c.label,
    });
  });
  y += phase345H;

  // Verify strip
  push(`<rect class="lane" x="24" y="${y}" width="${W - 48}" height="72" rx="14"/>`);
  push(`<text class="phase" x="40" y="${y + 22}">Verify locally (always works)</text>`);
  push(`<text class="mono" x="40" y="${y + 44}">${esc(scenario.verify_cli)}</text>`);
  push(
    `<text class="caption" x="40" y="${y + 62}">Lab run (Terminal B): ${esc(String(scenario.lab_run).slice(0, 110))}${String(scenario.lab_run).length > 110 ? '…' : ''}</text>`
  );

  y += verifyH;
  push(
    `<text class="caption" x="24" y="${y}">Solid arrows = always-on lab path · Dashed = optional live indexing when SCAS_ES_URL is set before the mock starts</text>`
  );
  push(
    `<text class="caption" x="24" y="${y + 18}">Safety: localhost / 127.0.0.1 only · malicious paths require TESTBENCH_MODE=enabled · educational test bench, not an exploit kit</text>`
  );

  push(`</svg>\n`);
  return parts.join('\n');
}

function main() {
  let count = 0;
  for (const scenario of META) {
    const id = scenario.scenario_id;
    const diagramMeta = SCENARIO_DIAGRAMS[id] || {
      intro: scenario.trigger_action,
      attack_steps: [{ from: 'Learner', to: 'Victim', message: scenario.trigger_action }],
    };
    const basename = `scas-observability-scenario-${id}`;
    const assets = diagramAssetPaths(basename, 'observability');
    fs.mkdirSync(path.dirname(path.join(ROOT, assets.svg)), { recursive: true });
    fs.mkdirSync(path.dirname(path.join(ROOT, assets.excalidraw)), { recursive: true });
    fs.writeFileSync(
      path.join(ROOT, assets.excalidraw),
      `${JSON.stringify(buildExcalidraw(scenario, diagramMeta), null, 2)}\n`
    );
    fs.writeFileSync(path.join(ROOT, assets.svg), buildSvg(scenario, diagramMeta));
    count += 1;
    console.log(`wrote ${assets.svg}`);
  }
  console.log(`\nGenerated ${count} detailed scenario observability diagrams.`);
}

main();
