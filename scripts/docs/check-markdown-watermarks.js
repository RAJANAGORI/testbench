#!/usr/bin/env node
'use strict';

/**
 * Fail CI if tracked Markdown (and Cursor .mdc rules) contain typographic
 * watermarks: em/en dash, curly quotes, ellipsis, nbsp, zero-width, BOM.
 * Use ASCII '-' and straight quotes. Diagram SVG/Excalidraw are out of scope
 * (scripts/lib/diagram-specs.js still uses em dashes in drawing labels).
 *
 * Usage (repo root):
 *   node scripts/docs/check-markdown-watermarks.js
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

const NAMES = {
  '\u2014': 'em dash',
  '\u2013': 'en dash',
  '\u2018': 'curly quote',
  '\u2019': 'curly quote',
  '\u201c': 'curly quote',
  '\u201d': 'curly quote',
  '\u2212': 'minus sign',
  '\u2026': 'ellipsis',
  '\u00a0': 'nbsp',
  '\u200b': 'zero-width',
  '\u200c': 'zero-width',
  '\u200d': 'zero-width',
  '\ufeff': 'BOM',
  '\u00ad': 'soft hyphen',
};
const BANNED_RE = new RegExp('[' + Object.keys(NAMES).join('') + ']', 'g');

function gitFiles() {
  const out = execFileSync(
    'git',
    ['ls-files', '*.md', '*.mdx', '*.mdc'],
    { cwd: ROOT, encoding: 'utf8' }
  );
  return out.split('\n').filter(Boolean);
}

function snippet(line, index) {
  const start = Math.max(0, index - 24);
  const end = Math.min(line.length, index + 24);
  return line.slice(start, end).replace(/\s+/g, ' ');
}

const failures = [];
let scanned = 0;

for (const rel of gitFiles()) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) continue;
  scanned += 1;
  const text = fs.readFileSync(full, 'utf8');
  const lines = text.split(/\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    BANNED_RE.lastIndex = 0;
    let m;
    while ((m = BANNED_RE.exec(line))) {
      const name = NAMES[m[0]] || 'unicode';
      failures.push(`${rel}:${i + 1}: ${name} near "${snippet(line, m.index)}"`);
    }
  }
}

if (failures.length) {
  console.error('FAIL: typographic watermarks in tracked Markdown/.mdc');
  console.error('Use ASCII hyphen (-) and straight quotes. Do not use em/en dash.');
  for (const f of failures.slice(0, 40)) console.error(`  ${f}`);
  if (failures.length > 40) {
    console.error(`  ... ${failures.length - 40} more`);
  }
  console.error(`\nScanned ${scanned} files, ${failures.length} hit(s).`);
  process.exit(1);
}

console.log(`PASS: no em/en dash, curly quotes, or zero-width marks in ${scanned} Markdown/.mdc files`);
