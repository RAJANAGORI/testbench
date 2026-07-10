const DEFAULT_HOST = '0.0.0.0';
const CP_PORT = process.env.NEXT_PUBLIC_CONTROL_PLANE_PORT ?? '3101';

/** Browser → same-origin proxy prefix (see next.config rewrites). */
export const CONTROL_PLANE_API_PREFIX = '/api/cp';

export function clientHost(): string {
  if (typeof window !== 'undefined') return window.location.hostname;
  return DEFAULT_HOST;
}

/** SSR-safe host:port label — matches first paint before hydration. */
export function controlPlaneDisplayHost(): string {
  return `${DEFAULT_HOST}:${CP_PORT}`;
}

/** REST base URL for control-plane API calls. */
export function controlPlaneApiBase(): string {
  if (typeof window !== 'undefined') return CONTROL_PLANE_API_PREFIX;
  const port = process.env.CONTROL_PLANE_PORT ?? CP_PORT;
  return `http://127.0.0.1:${port}/api`;
}

/** WebSocket URL for live logs (proxied through the dashboard in the browser). */
export function controlPlaneWsUrl(): string {
  if (typeof window !== 'undefined') {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}/ws/logs`;
  }
  const port = process.env.CONTROL_PLANE_PORT ?? CP_PORT;
  return `ws://127.0.0.1:${port}/ws/logs`;
}

/** @deprecated Use controlPlaneApiBase — kept for any external references. */
export function controlPlaneUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  const port = process.env.CONTROL_PLANE_PORT ?? CP_PORT;
  return `http://127.0.0.1:${port}`;
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
