'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface LabSessionContextValue {
  /** Active process session to highlight in the terminal (undefined = all sessions). */
  sessionId?: string;
  setSessionId: (id: string | undefined) => void;
  /** Currently focused lab id (for dock label). */
  labId?: string;
  setLabId: (id: string | undefined) => void;
  followAll: boolean;
  setFollowAll: (v: boolean) => void;
}

const LabSessionContext = createContext<LabSessionContextValue | null>(null);

export function LabSessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionIdState] = useState<string | undefined>();
  const [labId, setLabId] = useState<string | undefined>();
  const [followAll, setFollowAll] = useState(true);

  const setSessionId = useCallback((id: string | undefined) => {
    setSessionIdState(id);
    if (id) setFollowAll(false);
  }, []);

  const value = useMemo(
    () => ({ sessionId, setSessionId, labId, setLabId, followAll, setFollowAll }),
    [sessionId, setSessionId, labId, followAll],
  );

  return <LabSessionContext.Provider value={value}>{children}</LabSessionContext.Provider>;
}

export function useLabSession(): LabSessionContextValue {
  const ctx = useContext(LabSessionContext);
  if (!ctx) {
    throw new Error('useLabSession must be used within LabSessionProvider');
  }
  return ctx;
}
