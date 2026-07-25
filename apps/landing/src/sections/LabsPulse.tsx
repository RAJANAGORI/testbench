import { site } from '../content/site';
import { AnimatedNumber } from '../components/motion-primitives/animated-number';
import { InView } from '../components/motion-primitives/in-view';
import { Tilt } from '../components/motion-primitives/tilt';

export function LabsPulse() {
  const { stats } = site;
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10">
      <InView>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--scas-primary)]">
          {stats.eyebrow}
        </p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-[var(--scas-text)] sm:text-5xl">
          {stats.headline}
        </h2>
      </InView>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {stats.items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-[var(--scas-border)] bg-[var(--scas-surface)] px-6 py-8"
          >
            <p className="font-display text-5xl font-semibold text-[var(--scas-primary)]">
              <AnimatedNumber value={item.value} />
              {item.suffix}
            </p>
            <p className="mt-2 text-sm text-[var(--scas-text-muted)]">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.tiles.map((tile) => (
          <Tilt key={tile.title}>
            <div className="h-full rounded-2xl border border-[var(--scas-border)] bg-[linear-gradient(160deg,var(--scas-surface),var(--scas-secondary))] p-6 shadow-[var(--scas-panel-shadow)]">
              <h3 className="font-display text-lg font-semibold text-[var(--scas-text)]">{tile.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--scas-text-muted)]">{tile.body}</p>
            </div>
          </Tilt>
        ))}
      </div>
    </section>
  );
}
