import { site } from '../content/site';
import { InfiniteSlider } from '../components/motion-primitives/infinite-slider';

export function ScenarioTicker() {
  return (
    <section className="border-y border-[var(--scas-border)] bg-[var(--scas-surface)]/70 py-6 backdrop-blur">
      <InfiniteSlider speed={55} gap={12}>
        {site.scenarioTicker.map((lab) => (
          <span
            key={lab.id}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--scas-border)] bg-[var(--scas-bg)] px-4 py-2 text-sm text-[var(--scas-text)]"
          >
            <span className="font-mono text-xs text-[var(--scas-primary)]">{lab.id}</span>
            <span className="font-medium">{lab.title}</span>
            <span className="rounded-full bg-[var(--scas-secondary)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--scas-text-muted)]">
              {lab.level}
            </span>
          </span>
        ))}
      </InfiniteSlider>
    </section>
  );
}
