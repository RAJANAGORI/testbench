import { controlPlaneApiBase, controlPlaneWsUrl } from './hosts';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${controlPlaneApiBase()}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  return res.json() as Promise<T>;
}

export interface ScenarioSummary {
  id: string;
  slug: string;
  title: string;
  level: string;
  ports: number[];
  activeProcesses?: number;
}

export interface ScenarioDetail extends ScenarioSummary {
  setup: { command: string; cwd: string };
  services: { id: string; label: string; port?: number }[];
  steps: { id: string; label: string }[];
  captures: { id: string; label: string; url: string }[];
  floci?: { seed?: string; verify?: string };
  docs: { readme: string; detect: string };
  processes?: { id: string; label: string; status: string }[];
}

export interface PlatformStatus {
  controlPlane: { ok: boolean; port: number };
  elasticsearch: { ok: boolean; url: string };
  kibana: { ok: boolean; url: string };
  floci: { ok: boolean; url: string };
  portConflicts: number[];
}

export interface LogEntry {
  sessionId: string;
  timestamp: string;
  stream: 'stdout' | 'stderr' | 'system';
  line: string;
}

export interface ProcessRecord {
  id: string;
  scenarioId?: string;
  label: string;
  status: 'running' | 'stopped' | 'failed' | 'completed';
  exitCode?: number | null;
}

export interface ActionResult {
  async?: boolean;
  started?: boolean;
  sessionId?: string;
  sessions?: string[];
  record?: ProcessRecord;
  startedProcesses?: ProcessRecord[];
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

/** Poll until a session leaves "running" (logs already stream over WebSocket). */
export async function waitForSession(
  sessionId: string,
  opts?: { intervalMs?: number; maxWaitMs?: number },
): Promise<ProcessRecord | undefined> {
  const intervalMs = opts?.intervalMs ?? 400;
  const deadline = Date.now() + (opts?.maxWaitMs ?? 30 * 60 * 1000);
  while (Date.now() < deadline) {
    const procs = await cp.processes();
    const hit = procs.find((p) => p.id === sessionId);
    if (!hit || hit.status !== 'running') return hit;
    await sleep(intervalMs);
  }
  return undefined;
}

export const cp = {
  getScenarios: () => api<ScenarioSummary[]>('/scenarios'),
  getScenario: (id: string) => api<ScenarioDetail>(`/scenarios/${id}`),
  setup: (id: string) => api<ActionResult>(`/scenarios/${id}/setup`, { method: 'POST' }),
  startServices: (id: string) => api<ActionResult>(`/scenarios/${id}/services/start`, { method: 'POST' }),
  stopServices: (id: string) => api(`/scenarios/${id}/services/stop`, { method: 'POST' }),
  runStep: (id: string, stepId: string) =>
    api<ActionResult>(`/scenarios/${id}/steps/${stepId}`, { method: 'POST' }),
  runAll: (id: string) => api<ActionResult>(`/scenarios/${id}/run`, { method: 'POST' }),
  getCaptures: (id: string) => api<Record<string, unknown>>(`/scenarios/${id}/captures`),
  clearCaptures: (id: string) => api(`/scenarios/${id}/captures`, { method: 'DELETE' }),
  floci: (id: string, action: 'seed' | 'verify') =>
    api<ActionResult>(`/scenarios/${id}/floci/${action}`, { method: 'POST' }),
  platformStatus: () => api<PlatformStatus>('/platform/status'),
  esUp: () => api<ActionResult>('/platform/elasticsearch/up', { method: 'POST' }),
  esDown: () => api<ActionResult>('/platform/elasticsearch/down', { method: 'POST' }),
  flociSetup: () => api<ActionResult>('/platform/floci/setup', { method: 'POST' }),
  flociUp: () => api<ActionResult>('/platform/floci/up', { method: 'POST' }),
  flociDown: () => api<ActionResult>('/platform/floci/down', { method: 'POST' }),
  teardown: () => api<ActionResult>('/platform/teardown', { method: 'POST' }),
  logs: (session?: string) => api<LogEntry[]>(session ? `/logs?session=${session}` : '/logs'),
  processes: () => api<ProcessRecord[]>('/processes'),
  wsUrl: () => controlPlaneWsUrl(),
};
