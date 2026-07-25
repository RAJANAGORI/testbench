'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { LogConsole } from '@/components/LogConsole';
import { useLabSession } from '@/components/LabSessionContext';

const HEIGHTS = {
  sm: {
    shell: 'h-[180px]',
    pad: 'pb-[180px]',
  },
  md: {
    shell: 'h-[min(36vh,380px)] min-h-[220px]',
    pad: 'pb-[min(36vh,380px)]',
  },
  lg: {
    shell: 'h-[min(52vh,560px)] min-h-[320px]',
    pad: 'pb-[min(52vh,560px)]',
  },
} as const;

type Size = keyof typeof HEIGHTS;

/** Labs workspace: scrollable controls + always-on live terminal dock. */
export function LabsWorkspace({ children }: { children: ReactNode }) {
  const { sessionId, followAll, setFollowAll, labId } = useLabSession();
  const [collapsed, setCollapsed] = useState(false);
  const [size, setSize] = useState<Size>('md');
  const [clearKey, setClearKey] = useState(0);
  const activeSession = followAll ? undefined : sessionId;

  useEffect(() => {
    if (sessionId) setCollapsed(false);
  }, [sessionId]);

  const pad = collapsed ? 'pb-12' : HEIGHTS[size].pad;

  return (
    <>
      <div className={pad}>{children}</div>
      <aside
        className={`fixed bottom-0 left-60 right-0 z-30 flex flex-col border-t border-line bg-[#0c0b14] shadow-[0_-12px_40px_rgba(0,0,0,0.35)] ${
          collapsed ? 'h-12' : HEIGHTS[size].shell
        }`}
        aria-label="Live lab output"
      >
        <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative flex h-2 w-2 shrink-0" title={sessionId ? 'Run in progress' : 'Ready'}>
              {sessionId ? (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50 opacity-75" />
              ) : null}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  sessionId ? 'bg-emerald-400' : 'bg-white/35'
                }`}
              />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
                Live output
              </p>
              {!collapsed && (
                <p className="truncate text-xs text-white/55">
                  {labId ? `Lab ${labId}` : 'All labs'}
                  {!followAll && sessionId
                    ? ` · session ${sessionId.slice(0, 8)}…`
                    : ' · every active session'}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {!collapsed && (
              <>
                <button
                  type="button"
                  onClick={() => setFollowAll(true)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                    followAll ? 'bg-brand text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  All
                </button>
                {sessionId && (
                  <button
                    type="button"
                    onClick={() => setFollowAll(false)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                      !followAll ? 'bg-brand text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    This run
                  </button>
                )}
                <div className="mx-1 hidden h-4 w-px bg-white/15 sm:block" />
                {(['sm', 'md', 'lg'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`hidden rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide sm:inline ${
                      size === s ? 'bg-white/15 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-label={`Terminal height ${s}`}
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setClearKey((k) => k + 1)}
                  className="rounded-full px-2.5 py-1 text-[11px] text-white/40 transition hover:bg-white/10 hover:text-white"
                >
                  Clear
                </button>
                <Link
                  href="/teardown"
                  className="rounded-full px-2.5 py-1 text-[11px] text-white/40 transition hover:bg-white/10 hover:text-rose-300"
                >
                  Reset
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-expanded={!collapsed}
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="min-h-0 flex-1">
            <LogConsole
              key={clearKey}
              sessionId={activeSession}
              fill
              hideChrome
              className="h-full rounded-none border-0 shadow-none"
            />
          </div>
        )}
      </aside>
    </>
  );
}
