import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#000000',
          elevated: '#0a0a0a',
          surface: '#111111',
          hover: '#1a1a1a',
          overlay: '#171717',
        },
        line: {
          subtle: 'rgba(255,255,255,0.05)',
          DEFAULT: 'rgba(255,255,255,0.09)',
          strong: 'rgba(255,255,255,0.14)',
        },
        ink: {
          primary: '#ffffff',
          secondary: '#d1d5db',
          muted: '#9ca3af',
          faint: '#6b7280',
        },
        brand: {
          DEFAULT: '#ffffff',
          light: '#f3f4f6',
          dark: '#e5e7eb',
          glow: 'rgba(255, 255, 255, 0.08)',
        },
        state: {
          ok: '#3ecf8e',
          warn: '#f5b942',
          error: '#f07178',
          info: '#9ca3af',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'Menlo', 'monospace'],
      },
      boxShadow: {
        panel: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.5)',
        glow: '0 0 40px rgba(255, 255, 255, 0.06)',
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
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
