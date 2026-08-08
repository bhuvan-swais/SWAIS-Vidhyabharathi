# SWAIS VidhyaBharathi

AI-enabled holistic learning platform for multiple schools. Single monorepo:
one backend (FastAPI) + one frontend (Next.js), multi-tenant.

## Structure
```
backend/          FastAPI API — all role modules under /api/v1  (port 8000)
  app/
    core/         config, security (auth), tenancy, scoping
    db/           SQLAlchemy base + models (every tenant table has school_id)
    api/v1/       one router per module (BVK terminology)
frontend/         Next.js app — role portals              (port 3000)
  app/            pravesha (login), vidyarthi, acharya, palaka, pradhana, nyasa
docs/             ARCHITECTURE, TENANCY, DEPLOYMENT, ONBOARDING
scripts/          setup.sh, deploy.sh
ecosystem.config.js   pm2 (backend + frontend)
```

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
bash scripts/setup.sh        # sets up backend venv + frontend deps
# fill backend/.env and frontend/.env.local from .env.example
```

## Deploy
See docs/DEPLOYMENT.md. Two pm2 apps, one nginx (/api -> 8000, / -> 3000).
