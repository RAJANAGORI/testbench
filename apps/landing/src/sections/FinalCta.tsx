import { site } from '../content/site';
import { Magnetic } from '../components/motion-primitives/magnetic';
import { InView } from '../components/motion-primitives/in-view';

export function FinalCta({ onDashboard }: { onDashboard: () => void }) {
  const { finalCta, footer, docsUrl } = site;
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:px-10">
      <InView>
        <div className="rounded-[2rem] bg-[var(--scas-primary)] px-8 py-14 text-center text-white sm:px-14">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            {finalCta.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/80 sm:text-base">{finalCta.support}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <button
                type="button"
                onClick={onDashboard}
                className="rounded-full bg-[var(--scas-surface)] px-7 py-3 text-sm font-semibold text-[var(--scas-primary)]"
              >
                {finalCta.primaryCta}
              </button>
            </Magnetic>
            <Magnetic intensity={0.2}>
              <a
                href={docsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white"
              >
                {finalCta.secondaryCta}
              </a>
            </Magnetic>
          </div>
        </div>
      </InView>
      <p className="mt-10 text-center text-xs text-[var(--scas-text-faint)]">{footer.note}</p>
    </section>
  );
}
