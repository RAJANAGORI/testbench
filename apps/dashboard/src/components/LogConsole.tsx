'use client';

import { useEffect, useRef, useState } from 'react';
import type { LogEntry } from '@/lib/api';
import { cp } from '@/lib/api';

interface LogConsoleProps {
  sessionId?: string;
  className?: string;
  tall?: boolean;
}

export function LogConsole({ sessionId, className = '', tall }: LogConsoleProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setLines([]);
    const ws = new WebSocket(sessionId ? `${cp.wsUrl()}?session=${sessionId}` : cp.wsUrl());

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (ev) => {
      try {
        const entry = JSON.parse(ev.data) as LogEntry;
        setLines((prev) => [...prev.slice(-499), entry]);
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      } catch {
        /* ignore */
      }
    };

    cp.logs(sessionId).then((initial) => setLines(initial.slice(-200))).catch(() => {});

    return () => ws.close();
  }, [sessionId]);

  const streamColor = (stream: LogEntry['stream']) => {
    if (stream === 'stderr') return 'text-rose-300';
    if (stream === 'system') return 'text-amber-300';
    return 'text-white/80';
  };

  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-[#0c0b14] text-[#e8e6f5] shadow-panel ${className}`}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Terminal</p>
          <p className="text-[11px] text-white/40">
            {sessionId ? `Session ${sessionId.slice(0, 8)}…` : 'All active sessions'}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 text-[11px] ${connected ? 'text-state-ok' : 'text-white/40'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-state-ok' : 'bg-white/30'}`} />
          {connected ? 'Live' : 'Connecting…'}
        </span>
      </div>
      <div className={`overflow-y-auto p-4 font-mono text-[11px] leading-5 ${tall ? 'h-[420px]' : 'h-56'}`}>
        {lines.length === 0 ? (
          <p className="text-white/35">Waiting for output…</p>
        ) : (
          lines.map((entry, i) => (
            <div key={`${entry.sessionId}-${entry.timestamp}-${i}`} className={streamColor(entry.stream)}>
              <span className="text-white/35">[{entry.timestamp.slice(11, 19)}]</span> {entry.line}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
