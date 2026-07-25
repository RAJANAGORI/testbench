import { site } from '../content/site';
import { AnimatedGroup, AnimatedItem } from '../components/motion-primitives/animated-group';
import { InView } from '../components/motion-primitives/in-view';

export function Tracks() {
  const { tracks } = site;
  return (
    <section className="border-t border-[var(--scas-border)] bg-[var(--scas-surface)]/50">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10">
        <InView>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--scas-primary)]">
            {tracks.eyebrow}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-[var(--scas-text)] sm:text-4xl">
            {tracks.headline}
          </h2>
        </InView>
        <AnimatedGroup className="mt-10 grid gap-3 md:grid-cols-3">
          {tracks.items.map((item) => (
            <AnimatedItem key={item.title}>
              <div className="rounded-2xl border border-[var(--scas-border)] bg-[var(--scas-bg)] p-5">
                <h3 className="font-display text-base font-semibold text-[var(--scas-text)]">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--scas-text-muted)]">{item.body}</p>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
}
