import { site } from '../content/site';
import { InView } from '../components/motion-primitives/in-view';
import { MorphingDialog } from '../components/motion-primitives/morphing-dialog';
import { TextShimmer } from '../components/motion-primitives/text-shimmer';

export function Safety() {
  const { safety } = site;
  return (
    <section className="bg-[var(--scas-secondary)]/55">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10">
        <InView>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--scas-primary)]">
            {safety.eyebrow}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight text-[var(--scas-text)] sm:text-5xl">
            {safety.headline}
          </h2>
          <p className="mt-4 max-w-2xl text-[var(--scas-text-muted)]">{safety.support}</p>
          <p className="mt-8 font-mono text-lg sm:text-2xl">
            <TextShimmer>{safety.shimmerText}</TextShimmer>
          </p>
          <div className="mt-8">
            <MorphingDialog
              title={safety.dialogTitle}
              trigger={
                <span className="inline-flex rounded-full border border-[var(--scas-border-strong)] bg-[var(--scas-surface)] px-5 py-2.5 text-sm font-semibold text-[var(--scas-text)]">
                  How the gate works
                </span>
              }
            >
              {safety.dialogBody}
            </MorphingDialog>
          </div>
        </InView>
      </div>
    </section>
  );
}
