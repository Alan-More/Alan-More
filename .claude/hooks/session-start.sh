#!/bin/bash
# Prepares Claude Code cloud sessions: installs npm dependencies and makes Node
# route HTTPS through the session proxy so Vercel AI Gateway (Jev + Claude) is reachable.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# npm install (not npm ci) so the cached container state is reused; idempotent
npm install --no-audit --no-fund

# Without this, Node's fetch bypasses HTTPS_PROXY and the gateway returns 403
if [ -n "${CLAUDE_ENV_FILE:-}" ] && ! grep -qs '^export NODE_USE_ENV_PROXY=1$' "$CLAUDE_ENV_FILE"; then
  echo 'export NODE_USE_ENV_PROXY=1' >> "$CLAUDE_ENV_FILE"
fi
