import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { resolve } from 'node:path';
import { createApiRouter } from './routes/api.js';
import { processManager } from './process-manager.js';

const HOST = '127.0.0.1';
const PORT = Number(process.env.CONTROL_PLANE_PORT ?? 3101);

// When launched from apps/control-plane, cwd is repo root's child — walk up to repo root
const cwd = process.cwd();
const REPO_ROOT = cwd.endsWith('control-plane')
  ? resolve(cwd, '../..')
  : cwd.endsWith('apps/control-plane')
    ? resolve(cwd, '../..')
    : cwd;
process.env.SCAS_REPO_ROOT = REPO_ROOT;

const app = express();
app.use(cors({ origin: ['http://127.0.0.1:3100', 'http://localhost:3100', 'http://127.0.0.1:5173', 'http://localhost:5173'] }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    service: 'SCAS Control Plane',
    status: 'ok',
    endpoints: {
      health: '/api/health',
      scenarios: '/api/scenarios',
      platform: '/api/platform/status',
      logs: '/ws/logs',
    },
    dashboard: 'http://127.0.0.1:3100',
    landing: 'http://127.0.0.1:5173',
  });
});

app.use('/api', createApiRouter());

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/logs' });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url ?? '', `http://${HOST}`);
  const sessionFilter = url.searchParams.get('session');

  const send = (data: unknown) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(data));
  };

  if (sessionFilter) {
    for (const entry of processManager.getLogs(sessionFilter)) send(entry);
  }

  const onLog = (entry: { sessionId: string }) => {
    if (!sessionFilter || entry.sessionId === sessionFilter) send(entry);
  };

  processManager.on('log', onLog);
  ws.on('close', () => processManager.off('log', onLog));
});

server.listen(PORT, HOST, () => {
  console.log(`SCAS control plane listening on http://${HOST}:${PORT}`);
  console.log(`Repo root: ${REPO_ROOT}`);
});
