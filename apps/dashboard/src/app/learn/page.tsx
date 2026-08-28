'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Alert, Btn, Card, LevelBadge, PageHeader } from '@/components/ui';
import { cp, type LearnIndex, type ScenarioSummary } from '@/lib/api';

function TrackCard({ s, beginHere }: { s: ScenarioSummary; beginHere?: boolean }) {
  const learn = s.learn;
  return (
    <Link
      href={`/scenarios/${s.id}`}
      prefetch
      className="group glass-panel block p-5 transition hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-ink-faint">#{s.id.padStart(2, '0')}</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {beginHere ? (
            <span className="rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 text-[11px] font-medium text-brand">
              Begin here
            </span>
          ) : null}
          <LevelBadge level={s.level} />
        </div>
      </div>
      <h3 className="mt-3 text-base font-semibold text-ink-primary transition group-hover:text-brand">
        {s.title}
      </h3>
      {learn ? (
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-ink-muted">{learn.why}</p>
      ) : null}
      <p className="mt-3 text-[11px] text-ink-faint">
        {learn ? `~${learn.minutes} min` : null}
        {learn?.nextTitle ? ` · next: ${learn.nextTitle}` : learn?.next === null ? ' · last on this track' : ''}
      </p>
    </Link>
  );
}

export default function LearnPage() {
  const [data, setData] = useState<LearnIndex | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    cp.getLearn()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  if (error) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Learn" description="Could not load the track." />
        <Alert variant="error">{error} - is the control plane running on port 3101?</Alert>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="animate-fade-in">
        <PageHeader eyebrow="Learn" title="A track, not a dump of 01-29" />
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        eyebrow="Learn"
        title="01, then 02, then 03, then a track"
        description="Foundation is pinned. Intermediate and Advanced follow the curriculum in SCENARIO_LEARNING_PATH, not numeric order."
        action={
          <Btn size="lg" href="/scenarios/01">Open lab 01</Btn>
        }
      />

      <div className="space-y-10">
        {data.tracks.map((track) => (
          <section key={track.id}>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink-primary">{track.label}</h2>
                <p className="mt-1 text-xs text-ink-muted">
                  {track.id === 'foundation'
                    ? 'Do these three before you skip ahead. First capture lives here.'
                    : track.id === 'intermediate'
                      ? 'Lockfiles, submodules, workspaces, cache. Same loop, messier trees.'
                      : 'CI, worms, signing theater, PyPI, scanner-in-CI. Heavy on purpose.'}
                </p>
              </div>
              <span className="text-[11px] text-ink-faint">{track.scenarios.length} labs</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {track.scenarios.map((s) => (
                <TrackCard key={s.id} s={s} beginHere={s.id === data.startId} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <Card title="CLI if you skip the UI" subtitle="Same first lab" className="mt-10">
        <pre className="overflow-x-auto rounded-xl border border-line bg-[#0c0b14] p-4 font-mono text-[11px] leading-relaxed text-white/70">
          {`source .scas.env
cd scenarios/01-typosquatting
./setup.sh`}
        </pre>
        <p className="mt-3 text-xs text-ink-muted">
          Full walkthrough: <span className="font-mono">documentation/scenario-guides/zero-to-hero/ZERO_TO_HERO_SCENARIO_01.md</span>
        </p>
      </Card>
    </div>
  );
}
