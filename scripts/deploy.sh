#!/usr/bin/env bash
# Routine deploy — SWAIS VidhyaBharathi
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Pull latest"
git pull origin main

echo "==> Backend: deps + restart"
cd backend
./.venv/bin/pip install -q -r requirements.txt
# ./.venv/bin/alembic upgrade head   # run per branch DB when migrations are set up
cd ..
pm2 restart vb-backend --update-env

echo "==> Frontend: build + restart"
cd frontend
npm ci
npm run build            # REQUIRED: NEXT_PUBLIC_* is baked in at build time
cd ..
pm2 restart vb-frontend --update-env

pm2 save
echo "==> Done:"
pm2 list
