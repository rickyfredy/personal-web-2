#!/usr/bin/env bash
# ============================================================
# deploy.sh — Deploy personal-web-2 to rfportfolio.online
# ============================================================
# Git-based deployment flow:
#   1. Commit & push to GitHub
#   2. Server pulls from GitHub, installs deps, builds, restarts
#
# Usage:
#   ./deploy.sh              # full deploy (push + pull + build + restart)
#   ./deploy.sh --backend    # deploy backend changes only
#   ./deploy.sh --frontend   # deploy frontend changes only
#   ./deploy.sh --skip-push  # skip local push, just pull + build on server
# ============================================================

set -euo pipefail

# ── Config ──────────────────────────────────────────────────
SERVER_USER="root"
SERVER_HOST="rfportfolio.online"
SERVER_DIR="/var/www/personal-web-2"
REPO_URL="https://github.com/rickyfredy/personal-web-2.git"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"

SKIP_PUSH=false
DEPLOY_FRONTEND=true
DEPLOY_BACKEND=true

for arg in "$@"; do
  case "$arg" in
    --skip-push)    SKIP_PUSH=true ;;
    --backend)      DEPLOY_FRONTEND=false ;;
    --frontend)     DEPLOY_BACKEND=false ;;
    *)              echo "Unknown arg: $arg"; exit 1 ;;
  esac
done

SSH_TARGET="${SERVER_USER}@${SERVER_HOST}"

echo "╔══════════════════════════════════════════════╗"
echo "  Deploy → ${SERVER_HOST}"
echo "  Flow: GitHub → git pull → build → restart"
echo "╚══════════════════════════════════════════════╝"

# ── Step 1: Commit & Push to GitHub ─────────────────────────
if ! $SKIP_PUSH; then
  echo ""
  echo "▶ [1/4] Pushing to GitHub..."
  cd "${LOCAL_DIR}"

  # Check for uncommitted changes
  if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    echo "  ✓ No local changes — already up to date"
  else
    git add -A
    git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')"
    echo "  ✓ Committed"
  fi

  git push origin main
  echo "  ✓ Pushed to origin/main"
else
  echo ""
  echo "▶ [1/4] Skipping push (--skip-push)"
fi

# ── Step 2: Server — Clone or Pull ──────────────────────────
echo ""
echo "▶ [2/4] Pulling latest code on server..."

ssh "${SSH_TARGET}" "
  if [ -d ${SERVER_DIR}/.git ]; then
    cd ${SERVER_DIR}
    git pull origin main
  else
    # First deploy — clone the repo
    if [ -d ${SERVER_DIR} ]; then
      # Directory exists but isn't a git repo — back up .env, clone fresh
      cp ${SERVER_DIR}/.env /tmp/personal-web-2.env.bak 2>/dev/null || true
      rm -rf ${SERVER_DIR}
      git clone ${REPO_URL} ${SERVER_DIR}
      cp /tmp/personal-web-2.env.bak ${SERVER_DIR}/.env 2>/dev/null || true
    else
      git clone ${REPO_URL} ${SERVER_DIR}
    fi
  fi
"
echo "  ✓ Code synced on server"

# ── Step 3: Server — Install & Build ────────────────────────
echo ""
echo "▶ [3/4] Installing deps & building on server..."

# Ensure .env exists on server
ssh "${SSH_TARGET}" "
  if [ ! -f ${SERVER_DIR}/.env ]; then
    echo '  ⚠ No .env on server — creating from .env.example'
    cat > ${SERVER_DIR}/.env << 'ENVEOF'
# ===========================
# Personal Web - Production
# ===========================
GEMINI_API_KEY=your_gemini_api_key_here
LLM_MODEL=gemini-3.1-flash-lite
FRONTEND_PORT=3000
BACKEND_PORT=4000
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
FRONTEND_URL=https://rfportfolio.online
ENVEOF
    echo '  ⚠ Please edit ${SERVER_DIR}/.env with real values!'
  fi
"

# Install frontend deps & build
if $DEPLOY_FRONTEND; then
  ssh "${SSH_TARGET}" "
    cd ${SERVER_DIR}
    echo '  Installing frontend deps...'
    npm install --prefix frontend
    echo '  Building Next.js...'
    npm run build
    echo '  Copying static assets to standalone...'
    cp -r frontend/.next/static frontend/.next/standalone/frontend/.next/static
    cp -r frontend/public frontend/.next/standalone/frontend/public
  "
  echo "  ✓ Frontend built"
fi

# Install backend deps
if $DEPLOY_BACKEND; then
  ssh "${SSH_TARGET}" "
    cd ${SERVER_DIR}
    if [ ! -d backend/venv ]; then
      echo '  Creating Python venv...'
      python3 -m venv backend/venv
    fi
    echo '  Installing backend deps...'
    backend/venv/bin/pip install -q -r backend/requirements.txt
  "
  echo "  ✓ Backend deps installed"
fi

# ── Step 4: Server — Systemd & Restart ──────────────────────
echo ""
echo "▶ [4/4] Configuring services & restarting..."

# Setup systemd services if they don't exist
ssh "${SSH_TARGET}" "
  # Backend service
  if [ ! -f /etc/systemd/system/rfportfolio-backend.service ]; then
    cat > /etc/systemd/system/rfportfolio-backend.service << 'EOF'
[Unit]
Description=RF Portfolio - Backend (FastAPI)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/personal-web-2
ExecStart=/var/www/personal-web-2/backend/venv/bin/python backend/main.py
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable rfportfolio-backend
  fi

  # Frontend service (runs standalone server from build output)
  if [ ! -f /etc/systemd/system/rfportfolio-frontend.service ]; then
    cat > /etc/systemd/system/rfportfolio-frontend.service << 'EOF'
[Unit]
Description=RF Portfolio - Frontend (Next.js)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/personal-web-2/frontend/.next/standalone/frontend
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable rfportfolio-frontend
  fi
"

# Stop any PM2 processes that might conflict with ports
ssh "${SSH_TARGET}" "pm2 stop all 2>/dev/null; pm2 delete all 2>/dev/null; pm2 save --force 2>/dev/null || true"

# Restart services
if $DEPLOY_BACKEND; then
  ssh "${SSH_TARGET}" "systemctl restart rfportfolio-backend"
  echo "  ✓ Backend restarted"
fi

if $DEPLOY_FRONTEND; then
  ssh "${SSH_TARGET}" "systemctl restart rfportfolio-frontend"
  echo "  ✓ Frontend restarted"
fi

# ── Done ────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "  ✓ Deploy complete!"
echo "  https://${SERVER_HOST}"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "Useful commands:"
echo "  ssh ${SSH_TARGET} 'systemctl status rfportfolio-frontend'"
echo "  ssh ${SSH_TARGET} 'systemctl status rfportfolio-backend'"
echo "  ssh ${SSH_TARGET} 'journalctl -u rfportfolio-frontend -f'"
echo "  ssh ${SSH_TARGET} 'journalctl -u rfportfolio-backend -f'"
