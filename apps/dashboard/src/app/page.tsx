'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Alert, Btn, Card, PageHeader, StatTile, StatusPill } from '@/components/ui';
import { cp, type PlatformStatus } from '@/lib/api';
import { controlPlaneUrl } from '@/lib/hosts';

interface ServiceRowProps {
  name: string;
  description: string;
  online: boolean;
  url?: string;
  actions?: ReactNode;
}

function ServiceRow({ name, description, online, url, actions }: ServiceRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-canvas-elevated/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium text-ink-primary">{name}</h3>
          <StatusPill status={online ? 'online' : 'offline'} label={online ? 'Running' : 'Stopped'} />
        </div>
        <p className="mt-1 text-xs text-ink-muted">{description}</p>
        {url && (
          <a href={url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-brand-light hover:underline">
            {url}
          </a>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export default function OverviewPage() {
  const [status, setStatus] = useState<PlatformStatus | null>(null);
  const [scenarioCount, setScenarioCount] = useState(23);
  const [busy, setBusy] = useState('');
  const [cpReachable, setCpReachable] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [plat, scenarios] = await Promise.all([
        cp.platformStatus(),
        cp.getScenarios(),
      ]);
      setStatus(plat);
      setScenarioCount(scenarios.length);
      setCpReachable(true);
    } catch {
      setStatus(null);
      setCpReachable(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 8000);
    return () => clearInterval(t);
  }, [refresh]);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    try {
      await fn();
      await refresh();
    } finally {
      setBusy('');
    }
  };

  const runningServices = [
    status?.elasticsearch.ok,
    status?.kibana.ok,
    status?.floci.ok,
  ].filter(Boolean).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Overview"
        title="Your lab command center"
        description="Start scenarios, watch live output, and manage observability — all on localhost."
        action={
          <Link href="/scenarios">
            <Btn size="lg">Browse labs →</Btn>
          </Link>
        }
      />

      {!cpReachable && (
        <Alert variant="error" >
          Control plane unreachable. Run <code className="rounded bg-canvas-hover px-1.5 py-0.5 font-mono text-xs">npm run dev:control-plane</code> or <code className="rounded bg-canvas-hover px-1.5 py-0.5 font-mono text-xs">./scripts/start-dashboard.sh</code>
        </Alert>
      )}

      {status?.portConflicts && status.portConflicts.length > 0 && (
        <div className="mt-4">
          <Alert variant="warn">
            Ports in use: {status.portConflicts.join(', ')} — stop conflicting labs or run Reset.
          </Alert>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Scenarios" value={scenarioCount} sub="Hands-on attack labs" accent="brand" />
        <StatTile
          label="Control plane"
          value={cpReachable ? 'Online' : 'Offline'}
          sub={controlPlaneUrl().replace(/^https?:\/\//, '')}
          accent={cpReachable ? 'ok' : 'warn'}
        />
        <StatTile label="Stack services" value={`${runningServices}/3`} sub="ES · Kibana · Floci" accent="warn" />
        <StatTile
          label="Port conflicts"
          value={status?.portConflicts?.length ?? 0}
          sub="Should be 0 before a new lab"
        />
      </div>

      <div className="mt-10">
        <Card
          title="Platform stack"
          subtitle="Optional observability and cloud emulator — start only when you need them"
        >
          <div className="space-y-3">
            <ServiceRow
              name="Elasticsearch"
              description="Indexes detection events and runbooks"
              online={status?.elasticsearch.ok ?? false}
              url={status?.elasticsearch.url}
              actions={
                <>
                  <Btn size="sm" variant="success" disabled={!!busy} onClick={() => run('es-up', cp.esUp)}>Start</Btn>
                  <Btn size="sm" variant="ghost" disabled={!!busy} onClick={() => run('es-down', cp.esDown)}>Stop</Btn>
                </>
              }
            />
            <ServiceRow
              name="Kibana"
              description="Visualize detections and hunt queries"
              online={status?.kibana.ok ?? false}
              url={status?.kibana.url}
              actions={
                <a href="http://127.0.0.1:5601" target="_blank" rel="noreferrer">
                  <Btn size="sm" variant="secondary">Open UI ↗</Btn>
                </a>
              }
            />
            <ServiceRow
              name="Floci"
              description="Local AWS emulator for cloud-track scenarios"
              online={status?.floci.ok ?? false}
              url={status?.floci.url}
              actions={
                <>
                  <Btn size="sm" variant="secondary" disabled={!!busy} onClick={() => run('floci-setup', cp.flociSetup)}>Setup</Btn>
                  <Btn size="sm" variant="success" disabled={!!busy} onClick={() => run('floci-up', cp.flociUp)}>Start</Btn>
                  <Btn size="sm" variant="ghost" disabled={!!busy} onClick={() => run('floci-down', cp.flociDown)}>Stop</Btn>
                </>
              }
            />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card title="Quick start" subtitle="Recommended flow for first-time users">
          <ol className="space-y-3 text-sm text-ink-secondary">
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-xs font-bold text-brand-light">1</span>Open a lab from the Labs page</li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-xs font-bold text-brand-light">2</span>Run <strong className="text-ink-primary">Prepare</strong> then <strong className="text-ink-primary">Execute</strong></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-xs font-bold text-brand-light">3</span>Watch captures and terminal output</li>
          </ol>
          <Link href="/scenarios" className="mt-5 inline-block">
            <Btn variant="secondary">Go to labs</Btn>
          </Link>
        </Card>
        <Card title="Safety" subtitle="Education-only constraints">
          <ul className="space-y-2 text-sm text-ink-muted">
            <li>• Lab exfil still targets <span className="text-ink-secondary">127.0.0.1</span> only</li>
            <li>• UI binds on <span className="text-ink-secondary">0.0.0.0</span> for local/LAN access</li>
            <li>• Payloads require <span className="font-mono text-xs text-ink-secondary">TESTBENCH_MODE=enabled</span></li>
            <li>• Use Reset lab when finished to free ports</li>
          </ul>
          <Link href="/teardown" className="mt-5 inline-block">
            <Btn variant="danger" size="sm">Reset lab environment</Btn>
          </Link>
        </Card>
      </div>
    </div>
  );
}
