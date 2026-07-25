import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

export function BorderTrail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative rounded-2xl p-[1px]', className)}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute inset-[-50%] animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0%,var(--scas-primary)_18%,var(--scas-accent)_36%,transparent_55%)] opacity-80" />
      </div>
      <div className="relative rounded-2xl bg-[var(--scas-surface)]">{children}</div>
    </div>
  );
}
