# SWAIS VidhyaBharathi

AI-enabled holistic learning platform for multiple schools. Single monorepo:
one backend (FastAPI) + one web (Next.js), multi-tenant.

## Structure (monorepo: web + mobile share one backend)
```
backend/          FastAPI API — all role modules under /api/v1  (port 8000)
  app/
    core/         config, security (auth), tenancy, scoping
    db/           SQLAlchemy base + models (every tenant table has school_id)
    api/v1/       one router per module (BVK terminology)
web/              Next.js — web + desktop browser            (port 3000)
  app/            pravesha (login), vidyarthi, acharya, palaka, pradhana, nyasa
mobile/           React Native + Expo — iOS + Android
  App.js, src/    navigation, persistent login, role screens
shared/           API client, auth, TS types — imported by web AND mobile
docs/             ARCHITECTURE, TENANCY, DATABASE, DEPLOYMENT
scripts/          setup.sh, deploy.sh
ecosystem.config.js   pm2 (backend + web)
package.json      npm workspaces: web, mobile, shared
```

- **web** and **mobile** are separate apps but **share** `shared/` (never copy logic between them).
- **backend** serves all clients (web + mobile) via the same REST API.
- Mobile keeps users logged in (token in device secure store) — no re-login, per BVK's ask.

## Modules (VidhyaBharathi terminology)
| Module | Role / area |
|---|---|
| Pravesha | Login & authentication |
| Vidyarthi | Student portal |
| Acharya | Teacher portal |
| Palaka | Parent / guardian portal |
| Pradhana Acharya | Principal dashboard |
| Nyasa | Trust / network dashboard (multi-school) |
| Panchakosha | Holistic development index |
| Samskara & Seva | Values & service |
| Granthalaya | Digital library |
| Prashasana | Administration |

## Multi-tenancy (short version — full detail in docs/TENANCY.md)
```
Branch (region) -> its own DATABASE   (BVK1, BVK2, ...)
   └── School   -> school_id column    (SCH1, SCH2, ...)
          └── Users (roles)
```
The AI service is **separate, stateless** (own repo): data in -> answer out; the
backend stores results and meters tokens per school for billing.

## Local dev
```bash
bash scripts/setup.sh        # sets up backend venv + web deps
# fill backend/.env and web/.env.local from .env.example
```

## Deploy
See docs/DEPLOYMENT.md. Two pm2 apps, one nginx (/api -> 8000, / -> 3000).
