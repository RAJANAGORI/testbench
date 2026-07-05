#!/usr/bin/env node

/**
 * Package Cache Poisoning Detector (Scenario 16)
 * Checks whether the scenario cache contains a malicious payload and recommends clearing it.
 */

const fs = require('fs');
const path = require('path');

function readIfExists(p) {
  try {
    if (!fs.existsSync(p)) return null;
    return fs.readFileSync(p, 'utf8');
  } catch (e) {
    return null;
  }
}

const target = process.argv[2] || 'victim-app';
const victimApp = path.isAbsolute(target) ? target : path.join(process.cwd(), target);
const scenarioRoot = fs.existsSync(path.join(victimApp, 'package.json'))
  ? path.dirname(victimApp)
  : process.cwd();

const cachePath = path.join(scenarioRoot, 'cache', 'cache-lib', 'index.js');
const installedPath = path.join(victimApp, 'node_modules', 'cache-lib', 'index.js');
const index = readIfExists(cachePath) || readIfExists(installedPath);

const suspicious = (index || '').includes('localhost:3016') || (index || '').includes('package-cache-poisoning');

console.log('🔍 Cache Poisoning Detector (Scenario 16)\n');
if (!index) {
  console.log('❌ Could not find cache-lib code. Checked:');
  console.log('  -', cachePath);
  console.log('  -', installedPath);
  process.exit(1);
}

if (suspicious) {
  console.log('🚨 Cache poisoning suspected: exfiltration endpoint found in cache/lib code.');
  console.log('\nRecommendation:');
  console.log(' - Clear local npm cache / poisoned cache directories');
  console.log(' - Reinstall dependencies in a clean environment');
  process.exit(2);
}

console.log('✅ No obvious cache poisoning indicators found.');
process.exit(0);

