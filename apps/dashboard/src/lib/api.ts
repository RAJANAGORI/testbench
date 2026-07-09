const CONTROL_PLANE = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL ?? 'http://127.0.0.1:3101';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${CONTROL_PLANE}/api${path}`, {
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

export const cp = {
  getScenarios: () => api<ScenarioSummary[]>('/scenarios'),
  getScenario: (id: string) => api<ScenarioDetail>(`/scenarios/${id}`),
  setup: (id: string) => api(`/scenarios/${id}/setup`, { method: 'POST' }),
  startServices: (id: string) => api(`/scenarios/${id}/services/start`, { method: 'POST' }),
  stopServices: (id: string) => api(`/scenarios/${id}/services/stop`, { method: 'POST' }),
  runStep: (id: string, stepId: string) => api(`/scenarios/${id}/steps/${stepId}`, { method: 'POST' }),
  runAll: (id: string) => api(`/scenarios/${id}/run`, { method: 'POST' }),
  getCaptures: (id: string) => api<Record<string, unknown>>(`/scenarios/${id}/captures`),
  clearCaptures: (id: string) => api(`/scenarios/${id}/captures`, { method: 'DELETE' }),
  floci: (id: string, action: 'seed' | 'verify') => api(`/scenarios/${id}/floci/${action}`, { method: 'POST' }),
  platformStatus: () => api<PlatformStatus>('/platform/status'),
  esUp: () => api('/platform/elasticsearch/up', { method: 'POST' }),
  esDown: () => api('/platform/elasticsearch/down', { method: 'POST' }),
  flociSetup: () => api('/platform/floci/setup', { method: 'POST' }),
  flociUp: () => api('/platform/floci/up', { method: 'POST' }),
  flociDown: () => api('/platform/floci/down', { method: 'POST' }),
  flociStatus: () => api('/platform/floci/status', { method: 'POST' }),
  teardown: () => api('/platform/teardown', { method: 'POST' }),
  logs: (session?: string) => api<LogEntry[]>(session ? `/logs?session=${session}` : '/logs'),
  processes: () => api('/processes'),
  wsUrl: () => CONTROL_PLANE.replace('http', 'ws') + '/ws/logs',
};

export { CONTROL_PLANE };
