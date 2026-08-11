# Architecture — SWAIS VidhyaBharathi

## Shape
One monorepo, two runtime apps, one stateless AI service (separate repo):

```
Browser ──► Frontend (Next.js :3000) ──► Backend (FastAPI :8000) ──► Branch DB (per region)
                                              │
                                              ├──► AI service (stateless, private)  — data in, answer out
                                              └──► Central DB — Nyasa analytics + AI billing
```

- **One backend, one web.** Login and all role portals live in one app on
  one origin — so they share one session. No cross-app SSO handoff, no per-module
  ports. (This is deliberately unlike the older per-module deployments.)
- **Role routing:** after login the token carries the role; the web routes
  to that role's portal, and every backend endpoint enforces it with
  `require_role(...)`. Frontend routing = UX; backend `require_role` = security.

## Modules → code
| Module | Backend router | Frontend route |
|---|---|---|
| Pravesha (auth) | `api/v1/pravesha.py` | `app/pravesha/` |
| Vidyarthi | `api/v1/vidyarthi.py` | `app/vidyarthi/` |
| Acharya | `api/v1/acharya.py` | `app/acharya/` |
| Palaka | `api/v1/palaka.py` | `app/palaka/` |
| Pradhana Acharya | `api/v1/pradhana.py` | `app/pradhana/` |
| Nyasa | `api/v1/nyasa.py` | `app/nyasa/` |
| Panchakosha | `api/v1/panchakosha.py` | shared components |
| Samskara & Seva | `api/v1/samskara.py` | shared components |
| Granthalaya | `api/v1/granthalaya.py` | shared components |
| Prashasana | `api/v1/prashasana.py` | (admin) |

## Shared code (why the monorepo exists)
Auth, tenancy, DB models live in `backend/app/core` and `backend/app/db` and are
**imported** by every module — not copied. This is what prevents the drift that
plagued the older per-repo products.

## AI service
Separate repo, **stateless**: receives content + params, returns the answer
(questions, summary, translation), and reports token usage. The backend calls it
server-to-server with a shared secret (never exposed publicly), stores results in
the branch DB, and records tokens per school in the central DB for billing.

## Tenancy
See [TENANCY.md](TENANCY.md): Branch (DB) → School (school_id) → User.
