# Deployment — SWAIS VidhyaBharathi

Same EC2. Two pm2 apps (backend + web) behind one nginx.

Staging: **https://staging.vb.swais.in** on EC2 **18.61.240.248** (shared SWAIS box).
Ports **8010 / 3010** (8000/3000 are taken by SGS/SSS — verify free: `sudo ss -tlnp`).

```
nginx (HTTPS, staging.vb.swais.in)
  ├── /api/  → 127.0.0.1:8010   vb-backend  (FastAPI/uvicorn)
  └── /      → 127.0.0.1:3010   vb-web (Next.js)
```

## First-time setup
```bash
git clone <repo> vidhyabharathi && cd vidhyabharathi
bash scripts/setup.sh                 # venv + web deps + copies .env templates
nano backend/.env                     # SECRET_KEY, DB password, FRONTEND_ORIGIN, Twilio, OTP mode
nano web/.env.local                   # NEXT_PUBLIC_API_BASE_URL=https://staging.vb.swais.in
cd web && npm run build && cd ..      # REQUIRED before start — bakes NEXT_PUBLIC_*
pm2 start ecosystem.config.js && pm2 save && pm2 startup
```

## nginx
```nginx
# /etc/nginx/sites-available/staging.vb.swais.in  (symlink into sites-enabled)
server {
    server_name staging.vb.swais.in;
    location /api/ { proxy_pass http://127.0.0.1:8010; proxy_set_header Host $host;
                     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                     proxy_set_header X-Forwarded-Proto $scheme; }
    location /     { proxy_pass http://127.0.0.1:3010; proxy_set_header Host $host;
                     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                     proxy_set_header X-Forwarded-Proto $scheme; }
}
```
`sudo nginx -t && sudo systemctl reload nginx && sudo certbot --nginx -d staging.vb.swais.in`

**Prod env values** (set before `npm run build`):
- `web/.env.local` → `NEXT_PUBLIC_API_BASE_URL=https://staging.vb.swais.in`
- `backend/.env` → `FRONTEND_ORIGIN=https://staging.vb.swais.in`, Twilio creds, `OTP_DELIVERY_MODE=twilio`
- Google OAuth client → add origin `https://staging.vb.swais.in` + redirect `https://staging.vb.swais.in/`
- EC2 security group: open **80 + 443** (8010/3010 stay internal — nginx proxies them)

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
