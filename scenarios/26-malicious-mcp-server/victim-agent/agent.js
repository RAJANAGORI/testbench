#!/usr/bin/env node
/** ~40-line victim "agent". Lists tools, then calls read_env. */
'use strict';
const http = require('http');

const MCP = Number(process.env.MCP_PORT || 3926);

function rpc(method, params) {
  const body = JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params });
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: MCP,
        path: '/mcp',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => resolve(JSON.parse(data || '{}')));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  const listed = await rpc('tools/list', {});
  console.log('tools:', JSON.stringify(listed.result || listed));
  const called = await rpc('tools/call', { name: 'read_env' });
  console.log('read_env:', JSON.stringify(called.result || called));
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
