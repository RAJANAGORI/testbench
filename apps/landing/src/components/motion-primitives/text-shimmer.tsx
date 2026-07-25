import { cn } from '../../lib/utils';

export function TextShimmer({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-block bg-[linear-gradient(110deg,var(--scas-text)_0%,var(--scas-text)_35%,var(--scas-primary)_50%,var(--scas-text)_65%,var(--scas-text)_100%)] bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer',
        className,
      )}
    >
      {children}
    </span>
  );
}
