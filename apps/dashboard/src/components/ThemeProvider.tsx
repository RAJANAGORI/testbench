'use client';

import { useEffect } from 'react';
import { applyTheme, readStoredTheme } from '@/lib/theme';

/** Applies stored theme on mount (bootstrap script handles FOUC). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(readStoredTheme());
  }, []);
  return children;
}
