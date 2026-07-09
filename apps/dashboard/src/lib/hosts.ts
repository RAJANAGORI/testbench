const DEFAULT_HOST = '0.0.0.0';

export function clientHost(): string {
  if (typeof window !== 'undefined') return window.location.hostname;
  return DEFAULT_HOST;
}

export function controlPlaneUrl(): string {
  const port = process.env.NEXT_PUBLIC_CONTROL_PLANE_PORT ?? '3101';
  const envUrl = process.env.NEXT_PUBLIC_CONTROL_PLANE_URL;
  if (typeof window !== 'undefined') {
    if (envUrl) {
      try {
        const u = new URL(envUrl);
        u.hostname = window.location.hostname;
        return u.origin;
      } catch {
        /* fall through */
      }
    }
    return `http://${window.location.hostname}:${port}`;
  }
  return envUrl ?? `http://${DEFAULT_HOST}:${port}`;
}

export function dashboardUrl(): string {
  const port = '3100';
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:${port}`;
  }
  return `http://${DEFAULT_HOST}:${port}`;
}

export function landingUrl(): string {
  const port = '5173';
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:${port}`;
  }
  return `http://${DEFAULT_HOST}:${port}`;
}
