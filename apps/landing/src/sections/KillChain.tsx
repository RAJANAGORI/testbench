import { site } from '../content/site';
import { AnimatedGroup, AnimatedItem } from '../components/motion-primitives/animated-group';
import { BorderTrail } from '../components/motion-primitives/border-trail';
import { InView } from '../components/motion-primitives/in-view';
import { TextLoop } from '../components/motion-primitives/text-loop';

export function KillChain() {
  const { killChain } = site;
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10">
      <InView>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--scas-primary)]">
          {killChain.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[var(--scas-text)] sm:text-5xl">
          <span className="text-[var(--scas-primary)]">
            <TextLoop texts={[...killChain.verbs]} />
          </span>
          <span className="mt-2 block">{killChain.headline}</span>
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--scas-text-muted)]">{killChain.support}</p>
      </InView>

      <AnimatedGroup className="mt-12 grid gap-4 md:grid-cols-3">
        {killChain.steps.map((step) => (
          <AnimatedItem key={step.title}>
            <BorderTrail>
              <div className="h-full rounded-2xl p-6">
                <p className="font-display text-xl font-semibold text-[var(--scas-text)]">{step.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--scas-text-muted)]">{step.body}</p>
              </div>
            </BorderTrail>
          </AnimatedItem>
        ))}
      </AnimatedGroup>
    </section>
  );
}
