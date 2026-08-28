/**
 * SCAS-FP-RN-8d4f2c9a1e7b3065 © Raja Nagori — Supply Chain Attack Simulator
 * Mock collector (localhost lab only).
 */

require('../../_shared/scenario-provenance');

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3025;
const logFile = path.join(__dirname, 'captured-data.json');

if (!fs.existsSync(logFile)) {
  fs.writeFileSync(logFile, JSON.stringify({ captures: [] }, null, 2));
}

function persistCapture(data, res) {
  console.log('\nCAPTURED DATA:');
  console.log(JSON.stringify(data, null, 2));
  const captures = JSON.parse(fs.readFileSync(logFile, 'utf8'));
  const captureEntry = { timestamp: new Date().toISOString(), data };
  captures.captures.push(captureEntry);
  fs.writeFileSync(logFile, JSON.stringify(captures, null, 2));
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'success', message: 'Data received' }));
  try {
    require('../../../detection-tools/es/forward-capture')
      .forwardCaptureIfEnabled(__dirname, captureEntry)
      .catch(() => {});
  } catch (_) {
    /* optional ES forwarding */
  }
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  if (req.method === 'POST' && parsed.pathname === '/collect') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        persistCapture(JSON.parse(body || '{}'), res);
      } catch (e) {
        console.error('Error processing data:', e);
        res.writeHead(400);
        res.end('Bad Request');
      }
    });
  } else if (req.method === 'GET' && parsed.pathname === '/captured-data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(fs.readFileSync(logFile, 'utf8'));
  } else if (req.method === 'DELETE' && parsed.pathname === '/captured-data') {
    fs.writeFileSync(logFile, JSON.stringify({ captures: [] }, null, 2));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'success', message: 'Data cleared' }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Mock collector on http://127.0.0.1:' + PORT);
  console.log('  POST   /collect');
  console.log('  GET    /captured-data');
  console.log('  DELETE /captured-data');
  console.log('Waiting for data...');
});
