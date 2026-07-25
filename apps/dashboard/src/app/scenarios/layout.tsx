'use client';

import type { ReactNode } from 'react';
import { LabSessionProvider } from '@/components/LabSessionContext';
import { LabsWorkspace } from '@/components/TerminalDock';

/** Labs workspace: scenario controls + always-visible live terminal. */
export default function LabsLayout({ children }: { children: ReactNode }) {
  return (
    <LabSessionProvider>
      <LabsWorkspace>{children}</LabsWorkspace>
    </LabSessionProvider>
  );
}
