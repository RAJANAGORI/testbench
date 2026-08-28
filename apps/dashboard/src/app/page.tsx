'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Alert, Btn, Card, PageHeader, StatTile, StatusPill } from '@/components/ui';
import { cp, type PlatformStatus } from '@/lib/api';
import { useControlPlaneDisplayHost } from '@/lib/use-hosts';

interface ServiceRowProps {
  name: string;
  description: string;
  online: boolean;
  url?: string;
  actions?: ReactNode;
}

function ServiceRow({ name, description, online, url, actions }: ServiceRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl liquid-glass p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium text-ink-primary">{name}</h3>
          <StatusPill status={online ? 'online' : 'offline'} label={online ? 'Running' : 'Stopped'} />
        </div>
        <p className="mt-1 text-xs text-ink-muted">{description}</p>
        {url && (
          <a href={url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-brand hover:text-brand-light hover:underline">
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
  const [scenarioCount, setScenarioCount] = useState(29);
  const [busy, setBusy] = useState('');
  const [cpReachable, setCpReachable] = useState(true);
  const cpDisplayHost = useControlPlaneDisplayHost();

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

  const run = async (
    label: string,
    fn: () => Promise<unknown>,
    opts?: { waitUntil?: (s: PlatformStatus | null) => boolean; maxWaitMs?: number },
  ) => {
    setBusy(label);
    try {
      // Platform scripts (Floci/ES) return immediately and run in the background
      await fn();
      await refresh();
      if (opts?.waitUntil) {
        const deadline = Date.now() + (opts.maxWaitMs ?? 8 * 60 * 1000);
        while (Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 3000));
          let latest: PlatformStatus | null = null;
          try {
            latest = await cp.platformStatus();
            setStatus(latest);
            setCpReachable(true);
          } catch {
            setCpReachable(false);
          }
          if (opts.waitUntil(latest)) break;
        }
      }
    } catch (err) {
      console.error(label, err);
    } finally {
      setBusy('');
      await refresh();
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
          <div className="flex flex-wrap gap-2">
            <Btn size="lg" href="/scenarios/01">Start here: lab 01</Btn>
            <Btn size="lg" variant="secondary" href="/learn">Learn track</Btn>
          </div>
        }
      />

      {!cpReachable && (
        <Alert variant="error" >
          Control plane unreachable. Run <code className="rounded bg-canvas-hover px-1.5 py-0.5 font-mono text-xs">npm run dev:control-plane</code> or <code className="rounded bg-canvas-hover px-1.5 py-0.5 font-mono text-xs">./scripts/ui/start-dashboard.sh</code>
        </Alert>
      )}

      {busy && (
        <div className="mt-4">
          <Alert variant="info">
            <span className="font-medium">{busy}</span> running in the background — first Floci/ES start can take several minutes.
            Watch live logs in the <Link href="/scenarios" className="underline">Labs</Link> terminal dock
            while a scenario runs.
          </Alert>
        </div>
      )}

      {status?.portConflicts && status.portConflicts.length > 0 && (
        <div className="mt-4">
          <Alert variant="warn">
            Lab ports in use: {status.portConflicts.join(', ')} — stop conflicting labs or run Reset.
          </Alert>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Scenarios" value={scenarioCount} sub="Hands-on attack labs" accent="brand" />
        <StatTile
          label="Control plane"
          value={cpReachable ? 'Online' : 'Offline'}
          sub={cpDisplayHost}
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
                  <Btn
                    size="sm"
                    variant="success"
                    disabled={!!busy}
                    onClick={() => run('es-up', cp.esUp, { waitUntil: (s) => !!s?.elasticsearch.ok })}
                  >
                    {busy === 'es-up' ? 'Starting…' : 'Start'}
                  </Btn>
                  <Btn
                    size="sm"
                    variant="ghost"
                    disabled={!!busy}
                    onClick={() => run('es-down', cp.esDown, { waitUntil: (s) => !s?.elasticsearch.ok, maxWaitMs: 120_000 })}
                  >
                    {busy === 'es-down' ? 'Stopping…' : 'Stop'}
                  </Btn>
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
                  <Btn
                    size="sm"
                    variant="secondary"
                    disabled={!!busy}
                    onClick={() => run('floci-setup', cp.flociSetup, { maxWaitMs: 60_000 })}
                  >
                    {busy === 'floci-setup' ? 'Setup…' : 'Setup'}
                  </Btn>
                  <Btn
                    size="sm"
                    variant="success"
                    disabled={!!busy}
                    onClick={() => run('floci-up', cp.flociUp, { waitUntil: (s) => !!s?.floci.ok })}
                  >
                    {busy === 'floci-up' ? 'Starting…' : 'Start'}
                  </Btn>
                  <Btn
                    size="sm"
                    variant="ghost"
                    disabled={!!busy}
                    onClick={() => run('floci-down', cp.flociDown, { waitUntil: (s) => !s?.floci.ok, maxWaitMs: 120_000 })}
                  >
                    {busy === 'floci-down' ? 'Stopping…' : 'Stop'}
                  </Btn>
                </>
              }
            />
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card title="Start here" subtitle="Typosquatting is the first capture, not lab 07">
          <p className="text-sm leading-relaxed text-ink-secondary">
            Open lab 01, read the Guide tab, then Prepare / Execute / Observe. After a capture lands on
            localhost, the Learn track sends you to 02 and 03.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Btn href="/scenarios/01">Open lab 01</Btn>
            <Btn variant="secondary" href="/learn">See the track</Btn>
          </div>
        </Card>
        <Card title="Safety" subtitle="Education-only constraints">
          <ul className="space-y-2 text-sm text-ink-muted">
            <li>• Lab exfil still targets <span className="text-ink-secondary">127.0.0.1</span> only</li>
            <li>• UI binds on <span className="text-ink-secondary">0.0.0.0</span> for local/LAN access</li>
            <li>• Payloads require <span className="font-mono text-xs text-ink-secondary">TESTBENCH_MODE=enabled</span></li>
            <li>• Use Reset lab when finished to free ports</li>
          </ul>
          <Btn variant="danger" size="sm" href="/teardown">Reset lab environment</Btn>
        </Card>
      </div>
    </div>
  );
}
