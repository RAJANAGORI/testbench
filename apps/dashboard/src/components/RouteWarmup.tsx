'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Primary workspace routes — warm so first click is not a multi-second compile.
 * `/scenarios/01` compiles the shared `scenarios/[id]` page for every lab id.
 */
const WARM_ROUTES = ['/scenarios', '/scenarios/01', '/teardown'] as const;

/**
 * Prefetch + soft-fetch key App Router pages after the shell mounts.
 * In `next dev`, the first compile of each route is expensive on Pi/HDD;
 * doing it in the background right after `/` loads hides that cost.
 */
export function RouteWarmup() {
  const router = useRouter();

  useEffect(() => {
    for (const path of WARM_ROUTES) {
      router.prefetch(path);
    }

    // Prefetch alone is not always enough in dev — a real document fetch forces compile.
    let cancelled = false;
    const warm = async () => {
      for (const path of WARM_ROUTES) {
        if (cancelled) return;
        try {
          await fetch(path, { credentials: 'same-origin', cache: 'no-store' });
        } catch {
          /* ignore — control plane / network blips */
        }
      }
    };
    void warm();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
