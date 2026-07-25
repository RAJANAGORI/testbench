import { site } from '../content/site';
import { Magnetic } from '../components/motion-primitives/magnetic';
import { ThemeToggle } from '../components/ThemeToggle';

export function Nav({ onDashboard }: { onDashboard: () => void }) {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[var(--scas-border)]/70 bg-[var(--scas-nav-bg)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <a href="/" className="font-display text-lg font-semibold tracking-tight text-[var(--scas-text)]">
          {site.brand}
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <a
            href={site.docsUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-3 py-2 text-sm font-medium text-[var(--scas-text-muted)] transition hover:text-[var(--scas-text)]"
          >
            {site.nav.docsLabel}
          </a>
          <Magnetic intensity={0.25}>
            <button
              type="button"
              onClick={onDashboard}
              className="rounded-full bg-[var(--scas-primary)] px-4 py-2 text-sm font-semibold text-white"
            >
              {site.nav.dashboardLabel}
            </button>
          </Magnetic>
        </div>
      </div>
    </nav>
  );
}
