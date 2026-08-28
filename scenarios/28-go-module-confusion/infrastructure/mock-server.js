/**
 * SCAS-FP-RN-8d4f2c9a1e7b3065 © Raja Nagori — Supply Chain Attack Simulator
 * Mock collector (localhost lab only).
 */

require('../../_shared/scenario-provenance');

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3028;
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
  } else if (req.method === 'GET' && parsed.pathname && parsed.pathname.indexOf('/@v/') !== -1) {
    const store = path.join(__dirname, 'goproxy-store');
    const rel = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
    const file = path.join(store, rel);
    if (rel.endsWith('/@v/list')) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('v1.2.3\n');
      return;
    }
    if (rel.endsWith('.info')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ Version: 'v1.2.3', Time: '2026-08-01T00:00:00Z' }));
      return;
    }
    if (rel.endsWith('.mod')) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('module example.com/corp/widget\n\ngo 1.22\n');
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, { 'Content-Type': 'application/zip' });
      res.end(fs.readFileSync(file));
      return;
    }
    const zipGuess = path.join(store, 'example.com/corp/widget/@v/v1.2.3.zip');
    if (rel.endsWith('.zip') && fs.existsSync(zipGuess)) {
      res.writeHead(200, { 'Content-Type': 'application/zip' });
      res.end(fs.readFileSync(zipGuess));
      return;
    }
    res.writeHead(404);
    res.end('module not found');
    return;
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
  console.log('  GOPROXY paths under /example.com/corp/widget/@v/');
  console.log('Waiting for data...');
});
