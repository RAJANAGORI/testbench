import { cn } from '../../lib/utils';
import type { ReactNode } from 'react';

export function InfiniteSlider({
  children,
  className,
  speed = 40,
  gap = 16,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  gap?: number;
}) {
  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      <div
        className="flex w-max animate-marquee hover:[animation-play-state:paused]"
        style={{ gap, ['--marquee-duration' as string]: `${speed}s` }}
      >
        <div className="flex shrink-0" style={{ gap }}>
          {children}
        </div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
