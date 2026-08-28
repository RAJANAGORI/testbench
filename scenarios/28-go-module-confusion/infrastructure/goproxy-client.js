#!/usr/bin/env node
/** Smoke helper when Go is not on PATH. Still talks to the mock GOPROXY, then POSTs /collect. */
'use strict';
const http = require('http');

function get(pathName) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port: 3028, path: pathName }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

(async () => {
  const list = await get('/example.com/corp/widget/@v/list');
  console.log('GOPROXY list', list.status, list.body.toString().trim());
  const zip = await get('/example.com/corp/widget/@v/v1.2.3.zip');
  console.log('GOPROXY zip', zip.status, 'bytes', zip.body.length);
  if (process.env.TESTBENCH_MODE !== 'enabled') {
    console.log('[SAFE MODE] skip collect');
    return;
  }
  const payload = JSON.stringify({
    scenario: '28',
    package: 'example.com/corp/widget',
    via: 'goproxy-client.js',
    zipBytes: zip.body.length,
  });
  await new Promise((resolve) => {
    const req = http.request({
      hostname: '127.0.0.1', port: 3028, path: '/collect', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, resolve);
    req.on('error', resolve);
    req.end(payload);
  });
  console.log('posted collect marker');
})().catch((e) => { console.error(e); process.exit(1); });
