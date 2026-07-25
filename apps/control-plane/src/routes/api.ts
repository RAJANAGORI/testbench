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

  router.post('/scenarios/:id/setup', (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    const record = processManager.runCommand({
      label: `Setup ${scenario.title}`,
      command: 'bash',
      args: [scenario.setup.command.replace('./', '')],
      cwd: scenario.setup.cwd,
      scenarioId: scenario.id,
      shell: false,
    });
    res.json({ async: true, started: true, sessionId: record.id, record });
  });

  router.post('/scenarios/:id/services/start', (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    const started = scenario.services.map((service) =>
      processManager.startLongRunning({
        label: service.label,
        command: service.command,
        args: service.args,
        scenarioCwd: scenario.setup.cwd,
        serviceCwd: service.cwd,
        scenarioId: scenario.id,
        serviceId: service.id,
        port: service.port,
      }),
    );
    res.json({
      async: true,
      started,
      sessions: started.map((r) => r.id),
      sessionId: started[0]?.id,
    });
  });

  router.post('/scenarios/:id/services/stop', async (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    const stopped = processManager.stopForScenario(scenario.id);
    await Promise.all(
      scenario.ports.map((port) => runScript(resolve(REPO, 'scripts/kill-port.sh'), [String(port)])),
    );
    res.json({ stopped, async: false });
  });

  router.post('/scenarios/:id/steps/:stepId', (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    const step = scenario.steps.find((s) => s.id === req.params.stepId);
    if (!step) return res.status(404).json({ error: 'Step not found' });
    const cwd = resolveScenarioCwd(scenario.setup.cwd, step.cwd);
    const record = processManager.runCommand({
      label: step.label,
      command: step.command,
      args: step.args,
      cwd,
      scenarioId: scenario.id,
      stepId: step.id,
      shell: step.shell,
    });
    res.json({ async: true, started: true, sessionId: record.id, record });
  });

  router.post('/scenarios/:id/run', (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });

    const job = processManager.startJob({
      label: `Full lab ${scenario.title}`,
      scenarioId: scenario.id,
      run: async ({ log, waitFor }) => {
        const mirrorTo = job.id;
        log('system', 'Phase 1/3 — setup');
        const setup = processManager.runCommand({
          label: `Setup ${scenario.title}`,
          command: 'bash',
          args: [scenario.setup.command.replace('./', '')],
          cwd: scenario.setup.cwd,
          scenarioId: scenario.id,
          mirrorTo,
        });
        const setupResult = await waitFor(setup.id);
        if (setupResult.status !== 'completed') {
          throw new Error(`Setup failed (exit ${setupResult.exitCode ?? 'null'})`);
        }

        log('system', 'Phase 2/3 — starting services');
        for (const service of scenario.services) {
          processManager.startLongRunning({
            label: service.label,
            command: service.command,
            args: service.args,
            scenarioCwd: scenario.setup.cwd,
            serviceCwd: service.cwd,
            scenarioId: scenario.id,
            serviceId: service.id,
            port: service.port,
            mirrorTo,
          });
        }
        // Brief settle so mocks bind ports before attack steps
        await new Promise((r) => setTimeout(r, 400));

        log('system', 'Phase 3/3 — attack steps');
        for (const step of scenario.steps) {
          log('system', `→ ${step.label}`);
          const cwd = resolveScenarioCwd(scenario.setup.cwd, step.cwd);
          const stepRecord = processManager.runCommand({
            label: step.label,
            command: step.command,
            args: step.args,
            cwd,
            scenarioId: scenario.id,
            stepId: step.id,
            shell: step.shell,
            mirrorTo,
          });
          const stepResult = await waitFor(stepRecord.id);
          if (stepResult.status !== 'completed') {
            throw new Error(`Step failed: ${step.label} (exit ${stepResult.exitCode ?? 'null'})`);
          }
        }
      },
    });

    res.json({ async: true, started: true, sessionId: job.id, sessions: [job.id] });
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

  router.post('/scenarios/:id/floci/:action', (req, res) => {
    const scenario = getScenario(req.params.id);
    if (!scenario?.floci) return res.status(404).json({ error: 'Floci not configured for scenario' });
    const script = req.params.action === 'seed' ? scenario.floci.seed : scenario.floci.verify;
    if (!script) return res.status(404).json({ error: 'Floci action not found' });
    const cwd = resolveScenarioCwd(scenario.setup.cwd);
    const record = processManager.runCommand({
      label: `Floci ${req.params.action}`,
      command: 'bash',
      args: [script],
      cwd,
      scenarioId: scenario.id,
    });
    res.json({ async: true, started: true, sessionId: record.id, record });
  });

  router.get('/platform/status', async (_req, res) => {
    // Lab/scenario ports only — do not flag ES/Kibana/Floci as "conflicts" when the stack owns them
    const labPorts = [3000, 3001, 3002, 3003, 3015, 3016, 3017, 3018, 3019, 3020, 3021, 3022, 3023, 4873, 4874];
    const [portHits, elasticsearchOk, kibanaOk, flociOk] = await Promise.all([
      Promise.all(labPorts.map(async (port) => ((await checkPort(port)) ? port : null))),
      probe('http://127.0.0.1:9200'),
      probe('http://127.0.0.1:5601/api/status'),
      probe('http://127.0.0.1:4566/_floci/health'),
    ]);
    const status: PlatformStatus = {
      controlPlane: { ok: true, port: Number(process.env.CONTROL_PLANE_PORT ?? 3101) },
      elasticsearch: { ok: elasticsearchOk, url: 'http://127.0.0.1:9200' },
      kibana: { ok: kibanaOk, url: 'http://127.0.0.1:5601' },
      floci: { ok: flociOk, url: 'http://127.0.0.1:4566' },
      portConflicts: portHits.filter((p): p is number => p != null),
    };
    res.json(status);
  });

  async function startPlatformScript(
    res: import('express').Response,
    label: string,
    scriptRel: string,
    args: string[] = [],
  ) {
    const scriptPath = resolve(REPO, scriptRel);
    const record = processManager.startDetached({
      label,
      command: 'bash',
      args: [scriptPath, ...args],
      cwd: REPO,
      scenarioId: 'platform',
      serviceId: label,
    });
    res.json({
      started: true,
      async: true,
      sessionId: record.id,
      label: record.label,
      message: `${label} started in the background. Watch the Labs terminal dock for logs.`,
    });
  }

  router.post('/platform/elasticsearch/:action', async (req, res) => {
    if (req.params.action === 'up') {
      return startPlatformScript(res, 'Elasticsearch up', 'scripts/elasticsearch-up.sh');
    }
    if (req.params.action === 'down') {
      return startPlatformScript(res, 'Elasticsearch down', 'scripts/elasticsearch-down.sh');
    }
    return res.status(400).json({ error: 'Unknown action' });
  });

  router.post('/platform/floci/:action', async (req, res) => {
    const map: Record<string, { label: string; script: string; args?: string[] }> = {
      // --auto: published native image when CPU has ARM LSE; else JVM build (Pi 4 / Cortex-A72)
      setup: { label: 'Floci setup', script: 'scripts/floci-setup.sh', args: ['--auto'] },
      up: { label: 'Floci up', script: 'scripts/floci-up.sh' },
      down: { label: 'Floci down', script: 'scripts/floci-down.sh' },
      status: { label: 'Floci status', script: 'scripts/floci-status.sh' },
    };
    const entry = map[req.params.action];
    if (!entry) return res.status(400).json({ error: 'Unknown action' });
    // status is quick — keep sync for a small JSON reply
    if (req.params.action === 'status') {
      const result = await runScript(resolve(REPO, entry.script), entry.args ?? []);
      return res.json(result);
    }
    return startPlatformScript(res, entry.label, entry.script, entry.args ?? []);
  });

  router.post('/platform/teardown', (_req, res) => {
    // Stop tracked lab children first so teardown does not need to kill our own PIDs.
    for (const proc of processManager.list()) {
      if (proc.status !== 'running') continue;
      if (proc.scenarioId && proc.scenarioId !== 'platform') {
        processManager.stopSession(proc.id);
      }
    }
    return startPlatformScript(res, 'Lab teardown', 'scripts/teardown.sh');
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
