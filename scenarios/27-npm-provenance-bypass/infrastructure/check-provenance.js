#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

const name = process.argv[2] || 'widget-lib';
const version = process.argv[3] || '1.0.1';
const trusted = 'https://github.com/example/repo/.github/workflows/release.yml';

function decide(doc) {
  const issuer = doc && doc.predicate && doc.predicate.runDetails && doc.predicate.runDetails.builder
    && doc.predicate.runDetails.builder.id;
  const ok = issuer === trusted;
  return { version, issuer: issuer || null, trustedPublisher: ok };
}

function fromFixture() {
  const p = path.join(__dirname, '../fixtures', `${name}-${version}.json`);
  if (!fs.existsSync(p)) return { version, issuer: null, trustedPublisher: false, missing: true };
  return decide(JSON.parse(fs.readFileSync(p, 'utf8')));
}

const req = http.get(`http://127.0.0.1:3027/attestations/${name}/${version}`, (res) => {
  let body = '';
  res.on('data', (c) => { body += c; });
  res.on('end', () => {
    let result;
    if (res.statusCode !== 200) result = fromFixture();
    else {
      try { result = decide(JSON.parse(body)); } catch { result = fromFixture(); }
    }
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.trustedPublisher ? 0 : 1);
  });
});
req.on('error', () => {
  const result = fromFixture();
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.trustedPublisher ? 0 : 1);
});
