#!/bin/zsh
set -e
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd /Users/eee/Desktop/code/siwei-city
PORT=5189
LOCAL_URL="http://127.0.0.1:$PORT/"
if [[ "${1:-}" == "--pages" ]]; then
  open -a Comet "https://brocademaple.github.io/siwei-city/v2/"
  exit 0
fi
if ! command -v npm >/dev/null; then
  print "Node.js/npm is required. Install Node.js, then run this launcher again."
  read "?Press Return to close. "
  exit 1
fi
if [[ ! -d node_modules ]]; then
  npm ci
fi
if lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  if curl -fsS "$LOCAL_URL" | rg -q '思维城邦|Siwei City'; then
    open -a Comet "$LOCAL_URL"
    exit 0
  fi
  print "Port $PORT is in use by another app. Stop it or use npm run dev manually."
  read "?Press Return to close. "
  exit 1
fi
(
  for attempt in {1..40}; do
    if curl -fsS "$LOCAL_URL" >/dev/null 2>&1; then
      open -a Comet "$LOCAL_URL"
      exit 0
    fi
    sleep 0.5
  done
) &
print "Starting Siwei City at $LOCAL_URL. Keep this Terminal window open."
npm run dev -- --host 127.0.0.1 --port "$PORT" --strictPort
