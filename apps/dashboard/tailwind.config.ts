import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: 'var(--scas-canvas)',
          elevated: 'var(--scas-canvas-elevated)',
          surface: 'var(--scas-canvas-surface)',
          hover: 'var(--scas-canvas-hover)',
          overlay: 'var(--scas-canvas-overlay)',
        },
        line: {
          subtle: 'var(--scas-line-subtle)',
          DEFAULT: 'var(--scas-line)',
          strong: 'var(--scas-line-strong)',
        },
        ink: {
          primary: 'var(--scas-ink)',
          secondary: 'var(--scas-ink-secondary)',
          muted: 'var(--scas-ink-muted)',
          faint: 'var(--scas-ink-faint)',
        },
        brand: {
          DEFAULT: 'var(--scas-brand)',
          light: 'var(--scas-brand-light)',
          dark: 'var(--scas-brand-dark)',
          glow: 'var(--scas-brand-glow)',
        },
        state: {
          ok: 'var(--scas-ok)',
          warn: 'var(--scas-warn)',
          error: 'var(--scas-error)',
          info: 'var(--scas-brand-light)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'Menlo', 'monospace'],
      },
      boxShadow: {
        panel: 'var(--scas-panel-shadow)',
        glow: '0 0 40px var(--scas-brand-glow)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
      letterSpacing: {
        cinematic: '-0.04em',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
