'use client';

import { useEffect, useState } from 'react';
import { controlPlaneDisplayHost } from './hosts';

const CP_PORT = process.env.NEXT_PUBLIC_CONTROL_PLANE_PORT ?? '3101';

/** Resolved control-plane label for display — avoids SSR/client hydration mismatch. */
export function useControlPlaneDisplayHost(): string {
  const [host, setHost] = useState(controlPlaneDisplayHost);

  useEffect(() => {
    setHost(`:${CP_PORT} proxied via :${window.location.port || '3100'}`);
  }, []);

  return host;
}
