export interface ScenarioLearn {
  minutes: number;
  track: 'foundation' | 'intermediate' | 'advanced';
  why: string;
  youWill: {
    prepare: string;
    execute: string;
    observe: string;
  };
  expect: string;
  next: string | null;
  nextTitle?: string;
  walkthrough: string;
}

export interface ScenarioService {
  id: string;
  label: string;
  command: string;
  args?: string[];
  cwd?: string;
  port?: number;
}

export interface ScenarioStep {
  id: string;
  label: string;
  command: string;
  args?: string[];
  cwd?: string;
  shell?: boolean;
}

export interface ScenarioCapture {
  id: string;
  label: string;
  url: string;
  clearUrl?: string;
}

export interface ScenarioFloci {
  seed?: string;
  verify?: string;
}

export interface ScenarioDefinition {
  id: string;
  slug: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  ports: number[];
  setup: { command: string; cwd: string };
  services: ScenarioService[];
  steps: ScenarioStep[];
  captures: ScenarioCapture[];
  floci?: ScenarioFloci;
  docs: { readme: string; detect: string };
  learn?: ScenarioLearn;
}

export interface ProcessRecord {
  id: string;
  scenarioId?: string;
  serviceId?: string;
  stepId?: string;
  label: string;
  pid?: number;
  status: 'running' | 'stopped' | 'failed' | 'completed';
  startedAt: string;
  endedAt?: string;
  exitCode?: number | null;
}

export interface LogEntry {
  sessionId: string;
  timestamp: string;
  stream: 'stdout' | 'stderr' | 'system';
  line: string;
}

export interface PlatformStatus {
  controlPlane: { ok: boolean; port: number };
  elasticsearch: { ok: boolean; url: string };
  kibana: { ok: boolean; url: string };
  floci: { ok: boolean; url: string };
  portConflicts: number[];
}
