import os from 'node:os';

/** Collect LAN IPv4 addresses for Next.js dev cross-origin access. */
function devOrigins() {
  const origins = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

  if (process.env.SCAS_LAN_IP) {
    for (const ip of process.env.SCAS_LAN_IP.split(/[\s,]+/)) {
      const trimmed = ip.trim();
      if (trimmed) origins.add(trimmed);
    }
  }

  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family === 'IPv4' && !addr.internal) {
        origins.add(addr.address);
        origins.add(`${addr.address}:3100`);
      }
    }
  }

  return [...origins];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: devOrigins(),
};

export default nextConfig;
