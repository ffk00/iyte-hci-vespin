#!/usr/bin/env bash
#
# Vespin one-shot local dev launcher.
#
#   ./dev.sh                 Start backend (Docker) + Expo (QR / interactive).
#   ./dev.sh --backend-only  Start backend only; skip Expo.
#   ./dev.sh --build         Rebuild the api dev image before starting.
#   ./dev.sh --down          Tear the backend stack down and exit.
#
# Override LAN IP detection (VPN, multi-NIC, or wrong guess):
#   VESPIN_LAN_IP=192.168.1.42 ./dev.sh
#
# Requires: Docker, Node 20+, pnpm 9+, curl. Go is NOT required — the API runs
# in Docker with hot reload. On Windows, run this from Git Bash or WSL.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
API_PORT=8080
HEALTH_URL="http://localhost:${API_PORT}/healthz"

BUILD=0
BACKEND_ONLY=0
DOWN=0
for arg in "$@"; do
  case "$arg" in
    --build)        BUILD=1 ;;
    --backend-only) BACKEND_ONLY=1 ;;
    --down)         DOWN=1 ;;
    -h|--help)      sed -n '3,15p' "$0"; exit 0 ;;
    *) echo "unknown flag: $arg (try --help)" >&2; exit 1 ;;
  esac
done

info() { printf '\033[36m> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m! %s\033[0m\n' "$*"; }
die()  { printf '\033[31mx %s\033[0m\n' "$*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || die "docker not found on PATH"

if [ "$DOWN" = 1 ]; then
  info "Tearing down backend stack..."
  ( cd "$BACKEND" && docker compose down )
  exit 0
fi

# ---- LAN IP detection -------------------------------------------------------
detect_lan_ip() {
  if [ -n "${VESPIN_LAN_IP:-}" ]; then echo "$VESPIN_LAN_IP"; return; fi
  local ip=""
  case "$(uname -s)" in
    Darwin)
      ip="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)" ;;
    Linux)
      ip="$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src"){print $(i+1); exit}}')"
      [ -z "$ip" ] && ip="$(hostname -I 2>/dev/null | awk '{print $1}')" ;;
    MINGW*|MSYS*|CYGWIN*)
      # Git Bash on Windows. ipconfig lists every adapter, including WSL/Hyper-V
      # vEthernet ones (often 172.x) a phone cannot reach. Collect all IPv4s,
      # then PREFER home/LAN ranges (192.168.x / 10.x) over anything virtual.
      local cands
      cands="$(ipconfig 2>/dev/null | tr -d '\r' \
               | awk -F: '/IPv4/ {gsub(/^[ \t]+/,"",$2); print $2}' \
               | grep -vE '^(127\.|169\.254\.)')"
      ip="$(printf '%s\n' "$cands" | grep -E '^(192\.168\.|10\.)' | head -1 || true)"
      [ -z "$ip" ] && ip="$(printf '%s\n' "$cands" | head -1)" ;;
  esac
  echo "$ip"
}

LAN_IP="$(detect_lan_ip || true)"
[ -n "$LAN_IP" ] || die "Could not auto-detect your LAN IP. Re-run as: VESPIN_LAN_IP=<ip> ./dev.sh"
info "LAN IP: $LAN_IP"

# ---- Backend ----------------------------------------------------------------
info "Starting backend stack (postgres + migrate + hot-reload api)..."
(
  cd "$BACKEND"
  if [ "$BUILD" = 1 ]; then docker compose up -d --build; else docker compose up -d; fi
)

info "Waiting for the API to report healthy at ${HEALTH_URL} ..."
tries=0
until curl -fsS "$HEALTH_URL" >/dev/null 2>&1; do
  tries=$((tries + 1))
  if [ "$tries" -ge 60 ]; then
    warn "API did not become healthy in ~2 minutes. Recent api logs:"
    ( cd "$BACKEND" && docker compose logs --tail=40 api )
    die "Backend unhealthy. Fix the error above, then re-run ./dev.sh"
  fi
  sleep 2
done
info "API is healthy."

if [ "$BACKEND_ONLY" = 1 ]; then
  info "Backend up (--backend-only). API: http://${LAN_IP}:${API_PORT}"
  exit 0
fi

# ---- Frontend env -----------------------------------------------------------
ENV_FILE="$FRONTEND/.env.local"
DESIRED="EXPO_PUBLIC_API_URL=http://${LAN_IP}:${API_PORT}"
if [ ! -f "$ENV_FILE" ] || ! grep -qxF "$DESIRED" "$ENV_FILE"; then
  echo "$DESIRED" > "$ENV_FILE"
  info "Wrote $ENV_FILE -> $DESIRED"
else
  info ".env.local already points at ${LAN_IP}"
fi

# ---- Frontend deps + codegen ------------------------------------------------
command -v pnpm >/dev/null 2>&1 || die "pnpm not found on PATH (needed for the frontend)"
cd "$FRONTEND"
if [ ! -d node_modules ]; then
  info "Installing frontend dependencies..."
  pnpm install
fi
info "Regenerating the API client from the OpenAPI spec..."
pnpm codegen

# ---- Launch Expo ------------------------------------------------------------
info "Starting Expo. Scan the QR with Expo Go, or press 'a'/'i' for an emulator."
exec pnpm start
