/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        scas: {
          text: 'var(--scas-text)',
          bg: 'var(--scas-bg)',
          primary: 'var(--scas-primary)',
          secondary: 'var(--scas-secondary)',
          accent: 'var(--scas-accent)',
        },
      },
      fontFamily: {
        sans: ['var(--scas-font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--scas-font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--scas-font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        cinematic: '-0.04em',
      },
    },
  },
  plugins: [],
};
