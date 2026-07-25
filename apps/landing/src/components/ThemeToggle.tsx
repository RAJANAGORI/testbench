import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { applyTheme, readStoredTheme, toggleTheme, type ScasTheme } from '../lib/theme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<ScasTheme>('light');

  useEffect(() => {
    const initial = readStoredTheme();
    setTheme(initial);
    applyTheme(initial);
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<ScasTheme>).detail;
      if (detail === 'light' || detail === 'dark') setTheme(detail);
    };
    window.addEventListener('scas-theme-change', onChange);
    return () => window.removeEventListener('scas-theme-change', onChange);
  }, []);

  return (
    <button
      type="button"
      data-theme-toggle
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme((t) => toggleTheme(t))}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--scas-border)] bg-[var(--scas-surface)] text-[var(--scas-text)] transition hover:border-[var(--scas-border-strong)] hover:bg-[var(--scas-surface-soft)] ${className}`}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
