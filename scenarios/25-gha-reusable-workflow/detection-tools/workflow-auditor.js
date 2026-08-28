#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const file = process.argv[2] || path.join(__dirname, '../workflows/unsafe.yml');
const text = fs.readFileSync(file, 'utf8');
const findings = [];
if (/pull_request_target/.test(text)) findings.push('pull_request_target');
if (/contents:\s*write/.test(text)) findings.push('permissions: contents write');
if (/action@v\d+/.test(text) && ! /@[0-9a-f]{40}/.test(text)) findings.push('floating tag');
console.log(JSON.stringify({ file, findings }, null, 2));
process.exit(findings.length ? 1 : 0);
