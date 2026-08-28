#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');

const names = process.argv.slice(2);
if (!names.length) {
  console.error('usage: node infrastructure/check-catalog.js <name> [name...]');
  process.exit(2);
}

const fixture = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'catalog-fixture.json'), 'utf8')
);

function localCheck(name) {
  const exists = fixture.packages.includes(name);
  return { name, exists, source: 'fixture' };
}

function remoteCheck(name) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:3024/catalog?name=${encodeURIComponent(name)}`, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({ name, exists: res.statusCode === 200, source: 'http' });
        }
      });
    });
    req.on('error', () => resolve({ ...localCheck(name), source: 'fixture-offline' }));
  });
}

(async () => {
  let failed = 0;
  for (const name of names) {
    const r = await remoteCheck(name);
    const exists = r.exists === true;
    if (!exists) failed += 1;
    console.log(`${name}: ${exists ? '200 in catalog' : '404 not in catalog'} (${r.source || 'check'})`);
    console.log('  Levenshtein against lodash/axios would not have saved you. The name never existed.');
  }
  process.exit(failed ? 1 : 0);
})();
