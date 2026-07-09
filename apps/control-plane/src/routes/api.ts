import { Router } from 'express';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { SCENARIOS, getScenario } from '../registry/scenarios.js';
import type { PlatformStatus } from '../registry/types.js';
import { processManager } from '../process-manager.js';
import { buildLabEnv, getRepoRoot, resolveScenarioCwd } from '../env.js';

const REPO = getRepoRoot();

async function probe(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function checkPort(port: number): Promise<boolean> {
  return new Promise((resolvePort) => {
    const server = createServer();
    server.once('error', () => resolvePort(true));
    server.once('listening', () => {
      server.close();
      resolvePort(false);
    });
    server.listen(port, '127.0.0.1');
  });
}

function runScript(scriptPath: string, args: string[] = []): Promise<{ code: number | null; output: string }> {
  return new Promise((resolveScript) => {
    const proc = spawn('bash', [scriptPath, ...args], {
      cwd: REPO,
      env: buildLabEnv(),
    });
    let output = '';
    proc.stdout.on('data', (c) => { output += c.toString(); });
    proc.stderr.on('data', (c) => { output += c.toString(); });
    proc.on('close', (code) => resolveScript({ code, output }));
  });
}

export function createApiRouter(): Router {
  const router = Router();

  router.get('/health', async (_req, res) => {
    const ports = [3000, 3001, 3002, 3003, 3015, 3016, 3017, 3018, 3019, 3020, 3021, 3022, 3023, 4873, 4874, 4566, 9200, 5601];
    const conflicts: number[] = [];
    for (const port of ports) {
      if (await checkPort(port)) conflicts.push(port);
    }
    res.json({ ok: true, port: Number(process.env.CONTROL_PLANE_PORT ?? 3101), portConflicts: conflicts });
  });

  router.get('/scenarios', (_req, res) => {
    const list = SCENARIOS.map((s) => ({
      ...s,
      activeProcesses: processManager.getActiveForScenario(s.id).length,
    }));
    res.json(list);
  });

  router.get('/scenarios/:id', (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json({
      ...scenario,
      processes: processManager.list().filter((p) => p.scenarioId === scenario.id),
    });
  });

  router.post('/scenarios/:id/setup', async (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    const record = await processManager.runCommand({
      label: `Setup ${scenario.title}`,
      command: 'bash',
      args: [scenario.setup.command.replace('./', '')],
      cwd: scenario.setup.cwd,
      scenarioId: scenario.id,
      shell: false,
    });
    res.json({ sessionId: record.id, record });
  });

  router.post('/scenarios/:id/services/start', async (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    const started = [];
    for (const service of scenario.services) {
      const record = await processManager.startLongRunning({
        label: service.label,
        command: service.command,
        args: service.args,
        scenarioCwd: scenario.setup.cwd,
        serviceCwd: service.cwd,
        scenarioId: scenario.id,
        serviceId: service.id,
        port: service.port,
      });
      started.push(record);
    }
    res.json({ started });
  });

  router.post('/scenarios/:id/services/stop', async (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    const stopped = processManager.stopForScenario(scenario.id);
    for (const port of scenario.ports) {
      await runScript(resolve(REPO, 'scripts/kill-port.sh'), [String(port)]);
    }
    res.json({ stopped });
  });

  router.post('/scenarios/:id/steps/:stepId', async (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    const step = scenario.steps.find((s) => s.id === req.params.stepId);
    if (!step) return res.status(404).json({ error: 'Step not found' });
    const cwd = resolveScenarioCwd(scenario.setup.cwd, step.cwd);
    const record = await processManager.runCommand({
      label: step.label,
      command: step.command,
      args: step.args,
      cwd,
      scenarioId: scenario.id,
      stepId: step.id,
      shell: step.shell,
    });
    res.json({ sessionId: record.id, record });
  });

  router.post('/scenarios/:id/run', async (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    const sessions: string[] = [];

    const setup = await processManager.runCommand({
      label: `Setup ${scenario.title}`,
      command: 'bash',
      args: [scenario.setup.command.replace('./', '')],
      cwd: scenario.setup.cwd,
      scenarioId: scenario.id,
    });
    sessions.push(setup.id);

    for (const service of scenario.services) {
      const svc = await processManager.startLongRunning({
        label: service.label,
        command: service.command,
        args: service.args,
        scenarioCwd: scenario.setup.cwd,
        serviceCwd: service.cwd,
        scenarioId: scenario.id,
        serviceId: service.id,
        port: service.port,
      });
      sessions.push(svc.id);
      await new Promise((r) => setTimeout(r, 800));
    }

    for (const step of scenario.steps) {
      const cwd = resolveScenarioCwd(scenario.setup.cwd, step.cwd);
      const stepRecord = await processManager.runCommand({
        label: step.label,
        command: step.command,
        args: step.args,
        cwd,
        scenarioId: scenario.id,
        stepId: step.id,
        shell: step.shell,
      });
      sessions.push(stepRecord.id);
    }

    res.json({ sessions });
  });

  router.get('/scenarios/:id/captures', async (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    const results: Record<string, unknown> = {};
    for (const cap of scenario.captures) {
      try {
        const response = await fetch(cap.url, { signal: AbortSignal.timeout(3000) });
        results[cap.id] = await response.json();
      } catch (err) {
        results[cap.id] = { error: err instanceof Error ? err.message : 'Fetch failed' };
      }
    }
    res.json(results);
  });

  router.delete('/scenarios/:id/captures', async (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    const results: Record<string, unknown> = {};
    for (const cap of scenario.captures) {
      if (!cap.clearUrl) continue;
      try {
        const response = await fetch(cap.clearUrl, { method: 'DELETE', signal: AbortSignal.timeout(3000) });
        results[cap.id] = await response.json();
      } catch (err) {
        results[cap.id] = { error: err instanceof Error ? err.message : 'Clear failed' };
      }
    }
    res.json(results);
  });

  router.post('/scenarios/:id/floci/:action', async (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario?.floci) return res.status(404).json({ error: 'Floci not configured for scenario' });
    const script = req.params.action === 'seed' ? scenario.floci.seed : scenario.floci.verify;
    if (!script) return res.status(404).json({ error: 'Floci action not found' });
    const cwd = resolveScenarioCwd(scenario.setup.cwd);
    const record = await processManager.runCommand({
      label: `Floci ${req.params.action}`,
      command: 'bash',
      args: [script],
      cwd,
      scenarioId: scenario.id,
    });
    res.json({ sessionId: record.id, record });
  });

  router.get('/platform/status', async (_req, res) => {
    const portConflicts: number[] = [];
    for (const port of [3000, 4873, 4874, 4566, 9200, 5601]) {
      if (await checkPort(port)) portConflicts.push(port);
    }
    const status: PlatformStatus = {
      controlPlane: { ok: true, port: Number(process.env.CONTROL_PLANE_PORT ?? 3101) },
      elasticsearch: { ok: await probe('http://127.0.0.1:9200'), url: 'http://127.0.0.1:9200' },
      kibana: { ok: await probe('http://127.0.0.1:5601/api/status'), url: 'http://127.0.0.1:5601' },
      floci: { ok: await probe('http://127.0.0.1:4566/_floci/health'), url: 'http://127.0.0.1:4566' },
      portConflicts,
    };
    res.json(status);
  });

  router.post('/platform/elasticsearch/:action', async (req, res) => {
    const script = req.params.action === 'up' ? 'scripts/elasticsearch-up.sh' : 'scripts/elasticsearch-down.sh';
    const result = await runScript(resolve(REPO, script));
    res.json(result);
  });

  router.post('/platform/floci/:action', async (req, res) => {
    const map: Record<string, string> = {
      setup: 'scripts/floci-setup.sh',
      up: 'scripts/floci-up.sh',
      down: 'scripts/floci-down.sh',
      status: 'scripts/floci-status.sh',
    };
    const script = map[req.params.action];
    if (!script) return res.status(400).json({ error: 'Unknown action' });
    const result = await runScript(resolve(REPO, script));
    res.json(result);
  });

  router.post('/platform/teardown', async (_req, res) => {
    const result = await runScript(resolve(REPO, 'scripts/teardown.sh'));
    res.json(result);
  });

  router.get('/logs', (req, res) => {
    const sessionId = req.query.session as string | undefined;
    if (sessionId) {
      return res.json(processManager.getLogs(sessionId));
    }
    const all = processManager.list().flatMap((p) => processManager.getLogs(p.id));
    all.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    res.json(all.slice(-500));
  });

  router.get('/processes', (_req, res) => {
    res.json(processManager.list());
  });

  return router;
}
