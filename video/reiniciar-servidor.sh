#!/usr/bin/env bash
# Reinicia el backend con la base recién sembrada (para regrabar el video desde cero).
# Uso: video/reiniciar-servidor.sh   (compila web/ si se pasa --build)
set -e
cd "$(dirname "$0")/../server"
for p in $(pgrep -x node || true); do
  tr '\0' ' ' < /proc/$p/cmdline | grep -q "src/index.js" && kill "$p" || true
done
sleep 1
[ "$1" = "--build" ] && (cd ../web && VITE_API_URL= npm run build >/dev/null)
npm run reset >/dev/null
CIRA_RETRASO_ALERTAS_SEG=10 PORT=3001 nohup node src/index.js > "${TMPDIR:-/tmp}/cira-server.log" 2>&1 &
for i in $(seq 1 30); do curl -sf -o /dev/null http://localhost:3001/login && exit 0; sleep 0.5; done
echo "El servidor no respondió" >&2; exit 1
