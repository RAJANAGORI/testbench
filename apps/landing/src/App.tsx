import { useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Clock, Play, Star } from 'lucide-react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4';

const DOCS_URL = 'https://simulator.rajanagori.in';

const SLIDES = [
  {
    title: 'Step Through. Attack Smarter.',
    description:
      'A voyage through supply-chain kill chains — typosquats, poisoned deps, and compromised pipelines on localhost.',
    meta: { rating: '23 Labs', duration: 'Localhost only' },
  },
  {
    title: 'Detect. Hunt. Defend.',
    description:
      'Stream live exfil captures, wire Elasticsearch, and rehearse blue-team runbooks without leaving your lab.',
    meta: { rating: 'ES + Kibana', duration: 'Floci track' },
  },
  {
    title: 'Learn by Breaking Trust.',
    description:
      'Twenty-three guided scenarios from beginner typosquats to multi-stage chains — education-only, gated payloads.',
    meta: { rating: 'Beginner → Adv', duration: '23 scenarios' },
  },
];

function resolveUrl(envUrl: string | undefined, port: string): string {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:${port}`;
  }
  return envUrl ?? `http://0.0.0.0:${port}`;
}

function fade(delay: number): CSSProperties {
  return { animationDelay: `${delay}ms` };
}

export default function App() {
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];

  const dashboard = () => {
    window.location.href = resolveUrl(import.meta.env.VITE_DASHBOARD_URL, '3100');
  };

  const prev = () => setSlide((s) => (s === 0 ? SLIDES.length - 1 : s - 1));
  const next = () => setSlide((s) => (s === SLIDES.length - 1 ? 0 : s + 1));

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden bg-black text-white">
      <video
        className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />

      <div
        className="bottom-blur-mask pointer-events-none fixed inset-0 z-[1] backdrop-blur-xl"
        aria-hidden
      />

      <nav className="relative z-50 px-4 py-4 sm:px-6 sm:py-6 md:px-12">
        <span
          className="animate-blur-fade-up inline-block h-8 text-lg font-semibold tracking-tight md:h-10 md:text-xl"
          style={fade(0)}
        >
          SCAS
        </span>
      </nav>

      <div className="relative z-10 flex flex-1 flex-col justify-end px-4 pb-8 sm:px-6 md:px-12 md:pb-16">
        <div className="flex flex-col items-end gap-8 md:flex-row">
          <div className="flex-1">
            <div
              className="animate-blur-fade-up mb-6 flex flex-wrap gap-3 text-xs sm:mb-8 sm:gap-6 sm:text-sm"
              style={fade(300)}
              key={`meta-${slide}`}
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Star className="h-4 w-4 fill-white sm:h-5 sm:w-5" />
                {current.meta.rating}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                {current.meta.duration}
              </span>
            </div>

            <h1
              className="animate-blur-fade-up mb-4 text-3xl font-normal tracking-cinematic sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl"
              style={fade(400)}
              key={`title-${slide}`}
            >
              {current.title}
            </h1>

            <p
              className="animate-blur-fade-up mb-6 max-w-2xl text-base text-gray-400 sm:mb-12 sm:text-lg md:text-xl"
              style={fade(500)}
              key={`desc-${slide}`}
            >
              {current.description}
            </p>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <button
                type="button"
                onClick={dashboard}
                className="animate-blur-fade-up flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gray-200 sm:px-8 sm:py-3 sm:text-base"
                style={fade(600)}
              >
                <Play size={18} className="fill-black" />
                Start Dashboard
              </button>
              <a
                href={DOCS_URL}
                target="_blank"
                rel="noreferrer"
                className="animate-blur-fade-up liquid-glass rounded-full px-6 py-2.5 text-sm font-medium sm:px-8 sm:py-3 sm:text-base"
                style={fade(700)}
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="flex w-full gap-3 md:w-auto md:justify-end">
            <button
              type="button"
              onClick={prev}
              className="animate-blur-fade-up liquid-glass flex items-center gap-1 rounded-full px-4 py-2.5 text-sm sm:px-6 sm:py-3"
              style={fade(800)}
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <button
              type="button"
              onClick={next}
              className="animate-blur-fade-up liquid-glass flex items-center gap-1 rounded-full px-4 py-2.5 text-sm sm:px-6 sm:py-3"
              style={fade(900)}
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
