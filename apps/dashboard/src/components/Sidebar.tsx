'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { landingUrl } from '@/lib/hosts';

const mainNav = [
  { href: '/', label: 'Overview', icon: '◈' },
  { href: '/scenarios', label: 'Labs', icon: '⬡' },
];

const utilityNav = [
  { href: '/teardown', label: 'Reset lab', icon: '↺', danger: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const [landing, setLanding] = useState('http://0.0.0.0:5173');

  useEffect(() => {
    setLanding(landingUrl());
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-line bg-canvas-elevated/95 backdrop-blur-md">
      <div className="border-b border-line px-5 py-5">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-glow">
            S
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-ink-primary transition group-hover:text-brand">
              SCAS
            </p>
            <p className="text-[11px] text-ink-muted">Control Center</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          Workspace
        </p>
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive(item.href)
                ? 'bg-brand text-white shadow-glow'
                : 'text-ink-muted hover:bg-canvas-hover hover:text-ink-primary'
            }`}
          >
            <span className="w-4 text-center text-xs opacity-70">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div className="my-4 border-t border-line" />

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
          System
        </p>
        {utilityNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive(item.href)
                ? 'bg-state-error/12 text-state-error ring-1 ring-state-error/20'
                : 'text-ink-muted hover:bg-state-error/8 hover:text-state-error'
            }`}
          >
            <span className="w-4 text-center text-xs opacity-70">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-line p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-ink-muted">Theme</span>
          <ThemeToggle />
        </div>
        <a
          href={landing}
          className="flex items-center justify-between rounded-full border border-line bg-canvas px-3 py-2.5 text-xs text-ink-muted transition hover:border-line-strong hover:text-ink-primary"
        >
          <span>Landing page</span>
          <span>↗</span>
        </a>
        <p className="px-1 text-[10px] leading-relaxed text-ink-faint">
          Localhost only · Education use
        </p>
      </div>
    </aside>
  );
}
