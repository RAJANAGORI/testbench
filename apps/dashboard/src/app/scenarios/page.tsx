'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Alert, Btn, LevelBadge, PageHeader, StatusPill } from '@/components/ui';
import { cp, type ScenarioSummary } from '@/lib/api';

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<(typeof levels)[number]>('All');

  useEffect(() => {
    cp.getScenarios()
      .then(setScenarios)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scenarios.filter((s) => {
      const matchLevel = level === 'All' || s.level === level;
      const matchQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.id.includes(q) ||
        s.slug.toLowerCase().includes(q);
      return matchLevel && matchQuery;
    });
  }, [scenarios, query, level]);

  if (error) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Labs" description="Could not load scenarios." />
        <Alert variant="error">{error} — is the control plane running on port 3101?</Alert>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Labs"
        title="Run labs with live output"
        description="Open a scenario, run Prepare / Execute — the terminal dock below streams backend logs the whole time."
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          placeholder="Search by name or number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="focus-ring w-full max-w-md rounded-full liquid-glass px-4 py-2.5 text-sm text-ink-primary placeholder:text-ink-faint sm:w-80"
        />
        <div className="flex flex-wrap gap-2">
          {levels.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                level === l
                  ? 'bg-brand text-white shadow-glow'
                  : 'text-ink-muted hover:bg-canvas-hover hover:text-ink-primary'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-xs text-ink-muted">
        {filtered.length} lab{filtered.length !== 1 ? 's' : ''} · live terminal pinned below
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s) => (
          <Link
            key={s.id}
            href={`/scenarios/${s.id}`}
            className="group glass-panel block p-5 transition hover:shadow-glow"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-xs text-ink-faint">#{s.id.padStart(2, '0')}</span>
              <LevelBadge level={s.level} />
            </div>
            <h2 className="mt-3 text-base font-semibold text-ink-primary transition group-hover:text-brand">
              {s.title}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {(s.activeProcesses ?? 0) > 0 ? (
                <StatusPill status="busy" label={`${s.activeProcesses} active`} />
              ) : (
                <StatusPill status="offline" label="Idle" />
              )}
              <span className="text-[11px] text-ink-faint">ports {s.ports.join(', ')}</span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && scenarios.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-ink-muted">No labs match your filters.</p>
          <Btn
            variant="ghost"
            className="mt-3"
            onClick={() => {
              setQuery('');
              setLevel('All');
            }}
          >
            Clear filters
          </Btn>
        </div>
      )}
    </div>
  );
}
