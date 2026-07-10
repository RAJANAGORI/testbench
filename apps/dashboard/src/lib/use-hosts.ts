'use client';

import { useEffect, useState } from 'react';
import { controlPlaneDisplayHost, controlPlaneUrl } from './hosts';

/** Resolved control-plane host:port for display — avoids SSR/client hydration mismatch. */
export function useControlPlaneDisplayHost(): string {
  const [host, setHost] = useState(controlPlaneDisplayHost);

  useEffect(() => {
    setHost(controlPlaneUrl().replace(/^https?:\/\//, ''));
  }, []);

  return host;
}
