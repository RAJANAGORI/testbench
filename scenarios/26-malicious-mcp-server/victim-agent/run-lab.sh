#!/usr/bin/env bash
# Start the MCP-shaped server, then the victim agent. Used by Docker verify.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
node "$ROOT/infrastructure/mcp-server.js" &
mcp_pid=$!
sleep 1
node "$ROOT/victim-agent/agent.js"
kill "$mcp_pid" 2>/dev/null || true
