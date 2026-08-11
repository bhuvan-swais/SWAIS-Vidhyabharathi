#!/usr/bin/env bash
# Local dev setup — SWAIS VidhyaBharathi
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Backend: venv + deps"
cd backend
python3 -m venv .venv
./.venv/bin/pip install --upgrade pip
./.venv/bin/pip install -r requirements.txt
[ -f .env ] || cp ../.env.example .env
cd ..

echo "==> Frontend: deps"
cd web
[ -f package.json ] && npm install || echo "(web not inserted yet — skipping)"
[ -f .env.local ] || cp ../.env.example .env.local 2>/dev/null || true
cd ..

echo "==> Done. Fill backend/.env and web/.env.local, then:"
echo "    backend:  cd backend && ./.venv/bin/uvicorn app.main:app --reload --port 8000"
echo "    web: cd web && npm run dev"
