import { cn } from '../../lib/utils';

export function SpinningText({
  children,
  className,
  radius = 72,
}: {
  children: string;
  className?: string;
  radius?: number;
}) {
  const chars = `${children} · `.split('');
  return (
    <div
      className={cn('relative grid place-items-center animate-spin-slow', className)}
      style={{ width: radius * 2, height: radius * 2 }}
      aria-hidden
    >
      {chars.map((char, i) => {
        const angle = (i / chars.length) * 360;
        return (
          <span
            key={`${char}-${i}`}
            className="absolute left-1/2 top-1/2 origin-[0_0] text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--scas-primary)]"
            style={{
              transform: `rotate(${angle}deg) translate(${radius}px) rotate(90deg)`,
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}
