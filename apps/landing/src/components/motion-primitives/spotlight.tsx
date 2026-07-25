import { useRef, useState, type ReactNode, type MouseEvent } from 'react';
import { cn } from '../../lib/utils';

export function Spotlight({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 40 });

  const onMove = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div ref={ref} onMouseMove={onMove} className={cn('relative overflow-hidden', className)}>
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, var(--scas-accent-glow), transparent 45%)`,
        }}
      />
      {children}
    </div>
  );
}
