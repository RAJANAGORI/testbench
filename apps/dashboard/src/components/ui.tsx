import type { ReactNode } from 'react';

/* ── Status ───────────────────────────────────────── */

export function StatusPill({
  status,
  label,
}: {
  status: 'online' | 'offline' | 'busy' | 'warn';
  label?: string;
}) {
  const styles = {
    online: 'bg-state-ok/12 text-state-ok border-state-ok/25',
    offline: 'bg-canvas-hover text-ink-muted border-line',
    busy: 'bg-brand/10 text-brand border-brand/25',
    warn: 'bg-state-warn/12 text-state-warn border-state-warn/25',
  };
  const dots = {
    online: 'bg-state-ok',
    offline: 'bg-ink-faint',
    busy: 'bg-brand animate-pulse-soft',
    warn: 'bg-state-warn',
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {label ?? status}
    </span>
  );
}

export function LevelBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    Beginner: 'bg-state-ok/10 text-state-ok border-state-ok/20',
    Intermediate: 'bg-state-warn/10 text-state-warn border-state-warn/20',
    Advanced: 'bg-state-error/10 text-state-error border-state-error/20',
  };
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${map[level] ?? 'border-line text-ink-muted'}`}>
      {level}
    </span>
  );
}

/* ── Layout primitives ────────────────────────────── */

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-in">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-muted">{eyebrow}</p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function Card({
  title,
  subtitle,
  children,
  action,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`glass-panel p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold text-ink-primary">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Alert({
  variant = 'info',
  children,
}: {
  variant?: 'info' | 'warn' | 'error' | 'success';
  children: ReactNode;
}) {
  const styles = {
    info: 'border-state-info/25 bg-state-info/8 text-state-info',
    warn: 'border-state-warn/25 bg-state-warn/8 text-state-warn',
    error: 'border-state-error/25 bg-state-error/8 text-state-error',
    success: 'border-state-ok/25 bg-state-ok/8 text-state-ok',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles[variant]}`}>
      {children}
    </div>
  );
}

/* ── Buttons ──────────────────────────────────────── */

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

export function Btn({
  children,
  onClick,
  variant = 'primary',
  disabled,
  size = 'md',
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };
  const variants: Record<BtnVariant, string> = {
    primary: 'bg-brand text-white hover:bg-brand-light border border-transparent shadow-glow',
    secondary: 'liquid-glass text-ink-primary hover:bg-canvas-hover',
    ghost: 'text-ink-secondary hover:text-ink-primary hover:bg-canvas-hover border border-transparent',
    danger: 'bg-state-error/12 text-state-error border border-state-error/25 hover:bg-state-error/20',
    success: 'bg-state-ok/12 text-state-ok border border-state-ok/25 hover:bg-state-ok/20',
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ── Workflow stepper (Hick's law: one phase at a time) ─ */

export function WorkflowTabs({
  steps,
  active,
  onChange,
}: {
  steps: { id: string; label: string; hint?: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl liquid-glass p-1.5">
      {steps.map((step, i) => {
        const isActive = step.id === active;
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onChange(step.id)}
            className={`focus-ring flex flex-1 min-w-[120px] flex-col items-start rounded-xl px-4 py-3 text-left transition ${
              isActive
                ? 'bg-brand text-white shadow-glow'
                : 'text-ink-muted hover:bg-canvas-hover hover:text-ink-secondary'
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
              Step {i + 1}
            </span>
            <span className="mt-0.5 text-sm font-medium">{step.label}</span>
            {step.hint && <span className="mt-0.5 text-[11px] text-ink-muted">{step.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ── Stat tile (overview scanning) ───────────────── */

export function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'brand' | 'ok' | 'warn';
}) {
  const accentBar = {
    brand: 'from-brand to-brand-light',
    ok: 'from-state-ok to-emerald-300',
    warn: 'from-state-warn to-amber-300',
  };
  return (
    <div className="glass-panel relative overflow-hidden p-5">
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accent ? accentBar[accent] : 'from-line to-transparent'}`} />
      <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-ink-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
    </div>
  );
}
