'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { landingUrl } from '@/lib/hosts';

const mainNav = [
  { href: '/', label: 'Overview', icon: '◈' },
  { href: '/scenarios', label: 'Labs', icon: '⬡' },
  { href: '/console', label: 'Output', icon: '▤' },
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
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-gray-800 bg-black/95 backdrop-blur-md">
      <div className="border-b border-gray-800 px-5 py-5">
        <Link href="/" className="group flex items-center gap-3">
          <span className="liquid-glass flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white">
            S
          </span>
          <div>
            <p className="text-sm font-semibold text-white transition group-hover:text-gray-300">SCAS</p>
            <p className="text-[11px] text-gray-400">Control Center</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Workspace</p>
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive(item.href)
                ? 'liquid-glass text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
            }`}
          >
            <span className="w-4 text-center text-xs opacity-70">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div className="my-4 border-t border-gray-800" />

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">System</p>
        {utilityNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive(item.href)
                ? 'bg-state-error/12 text-state-error ring-1 ring-state-error/20'
                : 'text-gray-400 hover:bg-state-error/8 hover:text-state-error'
            }`}
          >
            <span className="w-4 text-center text-xs opacity-70">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <a
          href={landing}
          className="liquid-glass flex items-center justify-between rounded-full px-3 py-2.5 text-xs text-gray-400 transition hover:text-gray-300"
        >
          <span>Landing page</span>
          <span>↗</span>
        </a>
        <p className="mt-3 px-1 text-[10px] leading-relaxed text-gray-500">
          Localhost only · Education use
        </p>
      </div>
    </aside>
  );
}
