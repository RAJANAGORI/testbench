import { Play } from 'lucide-react';
import { site } from '../content/site';
import { Magnetic } from '../components/motion-primitives/magnetic';
import { Spotlight } from '../components/motion-primitives/spotlight';
import { SpinningText } from '../components/motion-primitives/spinning-text';
import { TextEffect } from '../components/motion-primitives/text-effect';
import { TextScramble } from '../components/motion-primitives/text-scramble';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4';

export function Hero({
  onDashboard,
}: {
  onDashboard: () => void;
}) {
  return (
    <Spotlight className="relative min-h-[100svh] overflow-hidden">
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.18] grayscale"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--scas-secondary),transparent_55%),linear-gradient(180deg,color-mix(in_srgb,var(--scas-bg)_70%,transparent),var(--scas-bg)_78%)]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col px-5 pb-16 pt-28 sm:px-8 lg:px-10">
        <div className="absolute right-6 top-28 hidden md:block lg:right-12">
          <SpinningText>{site.hero.orbitLabel}</SpinningText>
        </div>

        <div className="mt-auto max-w-3xl">
          <TextScramble
            as="h1"
            className="font-display text-6xl font-semibold tracking-tight text-[var(--scas-text)] sm:text-7xl md:text-8xl"
          >
            {site.hero.brand}
          </TextScramble>

          <TextEffect
            as="p"
            per="word"
            preset="fade-in-blur"
            delay={0.35}
            className="mt-6 font-display text-2xl font-medium tracking-tight text-[var(--scas-text)] sm:text-3xl md:text-4xl"
          >
            {site.hero.headline}
          </TextEffect>

          <TextEffect
            as="p"
            per="word"
            preset="fade"
            delay={0.7}
            className="mt-5 max-w-xl text-base leading-relaxed text-[var(--scas-text-muted)] sm:text-lg"
          >
            {site.hero.support}
          </TextEffect>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Magnetic>
              <button
                type="button"
                onClick={onDashboard}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--scas-primary)] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_var(--scas-accent-glow)] transition hover:bg-[var(--scas-accent)]"
              >
                <Play size={16} className="fill-white" />
                {site.hero.primaryCta}
              </button>
            </Magnetic>
            <Magnetic intensity={0.2}>
              <a
                href={site.docsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-[var(--scas-border-strong)] bg-[var(--scas-surface)]/80 px-7 py-3 text-sm font-semibold text-[var(--scas-text)] backdrop-blur transition hover:bg-[var(--scas-secondary)]"
              >
                {site.hero.secondaryCta}
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </Spotlight>
  );
}
