# Deployment — SWAIS VidhyaBharathi

Same EC2. Two pm2 apps (backend + web) behind one nginx.

```
nginx (HTTPS)
  ├── /api/  → localhost:8000   vb-backend  (FastAPI/uvicorn)
  └── /      → localhost:3000   vb-web (Next.js)
```

## First-time setup
```bash
git clone <repo> vidhyabharathi && cd vidhyabharathi
bash scripts/setup.sh                 # backend venv + web deps
cp .env.example backend/.env          # fill backend values
cp .env.example web/.env.local   # fill NEXT_PUBLIC_* values
cd web && npm run build && cd ..
pm2 start ecosystem.config.js && pm2 save && pm2 startup
```

## nginx
```nginx
server {
    server_name vidhyabharathi.<domain>;
    location /api/ { proxy_pass http://localhost:8000; proxy_set_header Host $host;
                     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }
    location /     { proxy_pass http://localhost:3000; proxy_set_header Host $host;
                     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; }
}
```
`sudo nginx -t && sudo systemctl reload nginx && sudo certbot --nginx -d vidhyabharathi.<domain>`

## Routine deploy — `scripts/deploy.sh`
```bash
bash scripts/deploy.sh
```

## Lessons baked in (do NOT skip)
1. **`npm run build` before restarting the web** — `NEXT_PUBLIC_*` is
   compile-time. A restart alone will not apply changed env values.
2. **`interpreter: "none"` for uvicorn in pm2** — else pm2 runs it with Node and
   it crash-loops.
3. **Never start uvicorn manually alongside pm2** — you get an orphan holding the
   port and a crash loop. Always `pm2 restart`.
4. **`.env` lives only on the server, never committed.**
5. **Migrations run on every branch DB** — loop over all `<BRANCH>_DATABASE_URL`.

## Verify after deploy
```bash
pm2 list                                              # both online, restarts NOT climbing
curl -s -o /dev/null -w "%{http_code}\n" localhost:8000/api/health   # 200
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000             # 200
pm2 logs --lines 20                                   # no tracebacks / bind errors
```

## Rollback
```bash
git rev-parse --short HEAD > /tmp/vb-prev.txt   # before deploy
# if broken:
git reset --hard $(cat /tmp/vb-prev.txt)
cd web && npm run build && cd ..
pm2 restart vb-backend vb-web
```
