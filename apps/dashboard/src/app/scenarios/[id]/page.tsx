'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Btn, Card, LevelBadge, PageHeader, StatusPill, WorkflowTabs } from '@/components/ui';
import { LogConsole } from '@/components/LogConsole';
import { cp, type ScenarioDetail } from '@/lib/api';

const WORKFLOW = [
  { id: 'prepare', label: 'Prepare', hint: 'Setup & services' },
  { id: 'execute', label: 'Execute', hint: 'Attack steps' },
  { id: 'observe', label: 'Observe', hint: 'Captures & logs' },
] as const;

type Phase = (typeof WORKFLOW)[number]['id'];

export default function ScenarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [captures, setCaptures] = useState<Record<string, unknown>>({});
  const [sessionId, setSessionId] = useState<string>();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<Phase>('prepare');

  const load = useCallback(async () => {
    try {
      setScenario(await cp.getScenario(id));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  }, [id]);

  const loadCaptures = useCallback(async () => {
    try {
      setCaptures(await cp.getCaptures(id));
    } catch {
      setCaptures({});
    }
  }, [id]);

  useEffect(() => {
    load();
    loadCaptures();
    const t = setInterval(loadCaptures, 4000);
    return () => clearInterval(t);
  }, [load, loadCaptures]);

  const action = async (label: string, fn: () => Promise<unknown>, nextPhase?: Phase) => {
    setBusy(label);
    setError('');
    try {
      const res = (await fn()) as { sessionId?: string; sessions?: string[] };
      if (res.sessionId) setSessionId(res.sessionId);
      if (res.sessions?.length) setSessionId(res.sessions[res.sessions.length - 1]);
      await load();
      await loadCaptures();
      if (nextPhase) setPhase(nextPhase);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy('');
    }
  };

  if (!scenario && !error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <StatusPill status="busy" label="Loading lab…" />
      </div>
    );
  }

  if (error && !scenario) {
    return (
      <div className="animate-fade-in">
        <Alert variant="error">{error}</Alert>
        <Link href="/scenarios" className="mt-4 inline-block"><Btn variant="secondary">← Back to labs</Btn></Link>
      </div>
    );
  }

  if (!scenario) return null;

  const activeCount = scenario.processes?.filter((p) => p.status === 'running').length ?? 0;
  const hasCaptures = Object.values(captures).some(
    (v) => v && typeof v === 'object' && 'captures' in (v as object) && Array.isArray((v as { captures: unknown[] }).captures) && (v as { captures: unknown[] }).captures.length > 0,
  );

  return (
    <div className="animate-fade-in">
      <Link href="/scenarios" className="text-xs font-medium text-ink-muted hover:text-brand-light transition">
        ← All labs
      </Link>

      <PageHeader
        eyebrow={`Lab ${scenario.id}`}
        title={scenario.title}
        description={`${scenario.level} · ports ${scenario.ports.join(', ')}`}
        action={
          <div className="flex flex-wrap gap-2">
            {activeCount > 0 && <StatusPill status="busy" label={`${activeCount} running`} />}
            <LevelBadge level={scenario.level} />
          </div>
        }
      />

      {error && <div className="mb-4"><Alert variant="error">{error}</Alert></div>}

      <WorkflowTabs steps={[...WORKFLOW]} active={phase} onChange={(id) => setPhase(id as Phase)} />

      <div className="mt-6">
        {phase === 'prepare' && (
          <div className="space-y-4">
            <Card
              title="One-click full lab"
              subtitle="Runs setup → services → all attack steps automatically"
            >
              <Btn
                size="lg"
                disabled={!!busy}
                onClick={() => action('run-all', () => cp.runAll(id), 'observe')}
              >
                {busy === 'run-all' ? 'Running…' : 'Run full lab'}
              </Btn>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card title="Step 1 — Setup" subtitle="Creates packages, victim app, and mock infrastructure">
                <Btn
                  disabled={!!busy}
                  onClick={() => action('setup', () => cp.setup(id))}
                >
                  {busy === 'setup' ? 'Setting up…' : 'Run setup'}
                </Btn>
              </Card>
              <Card title="Step 2 — Services" subtitle="Starts mock servers and registries">
                <div className="flex flex-wrap gap-2">
                  <Btn
                    variant="success"
                    disabled={!!busy}
                    onClick={() => action('services', () => cp.startServices(id), 'execute')}
                  >
                    Start services
                  </Btn>
                  <Btn
                    variant="danger"
                    disabled={!!busy}
                    onClick={() => action('stop', () => cp.stopServices(id))}
                  >
                    Stop
                  </Btn>
                </div>
                <ul className="mt-4 space-y-1.5 border-t border-line pt-4">
                  {scenario.services.map((svc) => (
                    <li key={svc.id} className="flex items-center gap-2 text-xs text-ink-muted">
                      <span className="h-1 w-1 rounded-full bg-ink-faint" />
                      {svc.label}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {scenario.floci && (
              <Card title="Floci (optional)" subtitle="Cloud-track seed and verification">
                <div className="flex gap-2">
                  <Btn variant="secondary" disabled={!!busy} onClick={() => action('floci-seed', () => cp.floci(id, 'seed'))}>Seed</Btn>
                  <Btn variant="secondary" disabled={!!busy} onClick={() => action('floci-verify', () => cp.floci(id, 'verify'))}>Verify</Btn>
                </div>
              </Card>
            )}
          </div>
        )}

        {phase === 'execute' && (
          <Card title="Attack steps" subtitle="Run each step after services are started">
            <ul className="divide-y divide-line">
              {scenario.steps.map((step, i) => (
                <li key={step.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canvas-hover text-xs font-semibold text-ink-muted">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-ink-primary">{step.label}</p>
                      <p className="text-[11px] text-ink-faint">step:{step.id}</p>
                    </div>
                  </div>
                  <Btn
                    variant="secondary"
                    size="sm"
                    disabled={!!busy}
                    onClick={() => action(step.id, () => cp.runStep(id, step.id), 'observe')}
                  >
                    Run
                  </Btn>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {phase === 'observe' && (
          <div className="space-y-4">
            <Card
              title="Exfiltration captures"
              subtitle={hasCaptures ? 'Data received by mock collector' : 'No captures yet — run attack steps first'}
              action={
                <Btn variant="ghost" size="sm" disabled={!!busy} onClick={() => action('clear', () => cp.clearCaptures(id))}>
                  Clear
                </Btn>
              }
            >
              <pre className="max-h-72 overflow-auto rounded-xl border border-line bg-canvas/80 p-4 font-mono text-[11px] leading-relaxed text-ink-secondary">
                {JSON.stringify(captures, null, 2)}
              </pre>
            </Card>
            <LogConsole sessionId={sessionId} tall />
          </div>
        )}
      </div>

      <p className="mt-8 text-[11px] text-ink-faint">
        Docs: {scenario.docs.readme} · {scenario.docs.detect}
      </p>
    </div>
  );
}
