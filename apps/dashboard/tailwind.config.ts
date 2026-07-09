import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#09090f',
          elevated: '#0f0f16',
          surface: '#15151e',
          hover: '#1c1c28',
          overlay: '#22222f',
        },
        line: {
          subtle: 'rgba(255,255,255,0.05)',
          DEFAULT: 'rgba(255,255,255,0.09)',
          strong: 'rgba(255,255,255,0.14)',
        },
        ink: {
          primary: '#f4f4f8',
          secondary: '#a8a8b8',
          muted: '#6b6b7b',
          faint: '#45455a',
        },
        brand: {
          DEFAULT: '#c8509a',
          light: '#e879c0',
          dark: '#9a3070',
          glow: 'rgba(200, 80, 154, 0.18)',
        },
        state: {
          ok: '#3ecf8e',
          warn: '#f5b942',
          error: '#f07178',
          info: '#6eb5ff',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'Menlo', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.35)',
        glow: '0 0 40px rgba(200, 80, 154, 0.12)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
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
