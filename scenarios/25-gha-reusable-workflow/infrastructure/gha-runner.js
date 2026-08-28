#!/usr/bin/env node
/**
 * Local workflow simulator. Does not call api.github.com.
 * Reads a YAML-ish uses: line and runs the local composite action.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const workflow = process.argv[2];
if (!workflow) {
  console.error('usage: node infrastructure/gha-runner.js workflows/unsafe.yml');
  process.exit(2);
}

const text = fs.readFileSync(path.resolve(workflow), 'utf8');
console.log('Simulating workflow', workflow);
if (/pull_request_target/.test(text)) {
  console.log('IOC: pull_request_target (pwn-request class)');
}
if (/contents:\s*write/.test(text)) {
  console.log('IOC: permissions.contents write');
}
if (/@v\d+\s*$/m.test(text) || /action@v1/.test(text)) {
  console.log('IOC: floating tag @v1');
}
if (/@[0-9a-f]{40}/.test(text)) {
  console.log('Pin: full SHA present');
}

const action = path.join(__dirname, '../actions/changed-files-like/index.js');
console.log('Loading local action', action);
require(action);
console.log('changed files (cover):', require(action).listChanged());
