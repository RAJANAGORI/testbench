import { randomUUID } from 'node:crypto';
import { spawn, type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import type { LogEntry, ProcessRecord } from './registry/types.js';
import { buildLabEnv, resolveScenarioCwd } from './env.js';

const MAX_LOG_LINES = 5000;

export class ProcessManager extends EventEmitter {
  private processes = new Map<string, { proc: ChildProcess; record: ProcessRecord }>();
  private logs = new Map<string, LogEntry[]>();

  list(): ProcessRecord[] {
    return Array.from(this.processes.values()).map((p) => p.record);
  }

  getLogs(sessionId: string): LogEntry[] {
    return this.logs.get(sessionId) ?? [];
  }

  getActiveForScenario(scenarioId: string): ProcessRecord[] {
    return this.list().filter((p) => p.scenarioId === scenarioId && p.status === 'running');
  }

  private appendLog(sessionId: string, stream: LogEntry['stream'], line: string): void {
    const entry: LogEntry = {
      sessionId,
      timestamp: new Date().toISOString(),
      stream,
      line,
    };
    const bucket = this.logs.get(sessionId) ?? [];
    bucket.push(entry);
    if (bucket.length > MAX_LOG_LINES) bucket.splice(0, bucket.length - MAX_LOG_LINES);
    this.logs.set(sessionId, bucket);
    this.emit('log', entry);
  }

  async runCommand(opts: {
    label: string;
    command: string;
    args?: string[];
    cwd: string;
    scenarioId?: string;
    serviceId?: string;
    stepId?: string;
    shell?: boolean;
    env?: Record<string, string>;
  }): Promise<ProcessRecord> {
    const sessionId = randomUUID();
    const record: ProcessRecord = {
      id: sessionId,
      scenarioId: opts.scenarioId,
      serviceId: opts.serviceId,
      stepId: opts.stepId,
      label: opts.label,
      status: 'running',
      startedAt: new Date().toISOString(),
    };

    this.logs.set(sessionId, []);
    this.appendLog(sessionId, 'system', `$ ${opts.command} ${(opts.args ?? []).join(' ')}`.trim());

    return new Promise((resolvePromise) => {
      const proc = spawn(opts.command, opts.args ?? [], {
        cwd: opts.cwd,
        env: buildLabEnv(opts.env),
        shell: opts.shell ?? false,
      });

      this.processes.set(sessionId, { proc, record });

      proc.stdout?.on('data', (chunk: Buffer) => {
        for (const line of chunk.toString().split(/\r?\n/)) {
          if (line) this.appendLog(sessionId, 'stdout', line);
        }
      });

      proc.stderr?.on('data', (chunk: Buffer) => {
        for (const line of chunk.toString().split(/\r?\n/)) {
          if (line) this.appendLog(sessionId, 'stderr', line);
        }
      });

      proc.on('error', (err) => {
        record.status = 'failed';
        record.endedAt = new Date().toISOString();
        this.appendLog(sessionId, 'system', `Process error: ${err.message}`);
        resolvePromise(record);
      });

      proc.on('close', (code) => {
        record.status = code === 0 ? 'completed' : 'failed';
        record.exitCode = code;
        record.endedAt = new Date().toISOString();
        record.pid = proc.pid;
        this.appendLog(sessionId, 'system', `Exited with code ${code ?? 'null'}`);
        resolvePromise(record);
      });
    });
  }

  /**
   * Fire-and-forget script/process — returns as soon as the child is spawned.
   * Use for long platform jobs (Floci/ES up) so HTTP proxies do not time out.
   */
  async startDetached(opts: {
    label: string;
    command: string;
    args?: string[];
    cwd: string;
    scenarioId?: string;
    serviceId?: string;
    env?: Record<string, string>;
  }): Promise<ProcessRecord> {
    const sessionId = randomUUID();
    const record: ProcessRecord = {
      id: sessionId,
      scenarioId: opts.scenarioId ?? 'platform',
      serviceId: opts.serviceId,
      label: opts.label,
      status: 'running',
      startedAt: new Date().toISOString(),
      pid: undefined,
    };

    this.logs.set(sessionId, []);
    this.appendLog(sessionId, 'system', `Starting ${opts.label} in ${opts.cwd}`);
    this.appendLog(sessionId, 'system', `$ ${opts.command} ${(opts.args ?? []).join(' ')}`.trim());

    const proc = spawn(opts.command, opts.args ?? [], {
      cwd: opts.cwd,
      env: buildLabEnv(opts.env),
      detached: false,
    });

    record.pid = proc.pid;
    this.processes.set(sessionId, { proc, record });

    proc.stdout?.on('data', (chunk: Buffer) => {
      for (const line of chunk.toString().split(/\r?\n/)) {
        if (line) this.appendLog(sessionId, 'stdout', line);
      }
    });

    proc.stderr?.on('data', (chunk: Buffer) => {
      for (const line of chunk.toString().split(/\r?\n/)) {
        if (line) this.appendLog(sessionId, 'stderr', line);
      }
    });

    proc.on('error', (err) => {
      record.status = 'failed';
      record.endedAt = new Date().toISOString();
      this.appendLog(sessionId, 'system', `Process error: ${err.message}`);
      this.emit('process-end', record);
    });

    proc.on('close', (code) => {
      record.status = code === 0 ? 'completed' : 'failed';
      record.exitCode = code;
      record.endedAt = new Date().toISOString();
      this.appendLog(sessionId, 'system', `${opts.label} finished (code ${code ?? 'null'})`);
      this.emit('process-end', record);
    });

    await new Promise((r) => setTimeout(r, 300));
    return record;
  }

  async startLongRunning(opts: {
    label: string;
    command: string;
    args?: string[];
    scenarioCwd: string;
    serviceCwd?: string;
    scenarioId: string;
    serviceId: string;
    port?: number;
  }): Promise<ProcessRecord> {
    const cwd = resolveScenarioCwd(opts.scenarioCwd, opts.serviceCwd);
    return this.startDetached({
      label: opts.label,
      command: opts.command,
      args: opts.args,
      cwd,
      scenarioId: opts.scenarioId,
      serviceId: opts.serviceId,
    });
  }

  stopSession(sessionId: string): boolean {
    const entry = this.processes.get(sessionId);
    if (!entry) return false;
    const { proc, record } = entry;
    if (proc.pid) {
      try {
        process.kill(proc.pid, 'SIGTERM');
      } catch {
        /* already dead */
      }
    }
    record.status = 'stopped';
    record.endedAt = new Date().toISOString();
    return true;
  }

  stopForScenario(scenarioId: string): number {
    let stopped = 0;
    for (const [id, { record }] of this.processes) {
      if (record.scenarioId === scenarioId && record.status === 'running') {
        if (this.stopSession(id)) stopped += 1;
      }
    }
    return stopped;
  }
}

export const processManager = new ProcessManager();
