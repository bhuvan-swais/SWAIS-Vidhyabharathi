# Demo → VidhyaBharathi conversion playbook

How to convert the 3 demo apps (Student, Admin, Headmaster — all FastAPI +
Next.js on `vb_prod`) into this monorepo (web + mobile + shared backend).

**Vidyarthi (Student) backend is the reference implementation** — copy its shape
for Admin and Headmaster.

## Module → role mapping
| Demo repo | Role (Sanskrit) | Backend router | Web route | Status |
|---|---|---|---|---|
| Student-Dashboard | **Vidyarthi** | `api/v1/vidyarthi.py` | `web/app/vidyarthi/` | **backend ✅**, web/mobile ▢ |
| Admin-Dashboard | **School Admin** | `api/v1/admin.py` | `web/app/admin/` | **backend ✅**, web/mobile ▢ |
| Headmaster-Dashboard | **Pradhana Acharya** | `api/v1/pradhana.py` | `web/app/pradhana/` | **backend ✅**, web/mobile ▢ |

Shared models in `db/models/common.py` (UserMaster, StudentMaster, TeacherMaster,
SchoolMaster, ClassMaster, SubjectMaster, NoticeBoard) — mapped once, reused by
all routers. All 3 backends compile + import cleanly (12 tables, no dup mappings).

## Tenancy (already wired)
- **Branch = DB.** Demo = the `DEMO` branch → `vb_prod`. Set `DEMO_DATABASE_URL` in `backend/.env`.
- **School = school_id (bigint).** Demo has `vb_school_master` + `school_id` on
  `vb_users_master`/`vb_class_master`. Most demo tables have **no** direct
  school_id (scoped via `class_id`), so their models use plain `Base`, **not**
  `TenantModel`. The demo is one school — fine.
- Token carries `{ user_id, branch: "DEMO", school_id, role }`.

## THE RULE (learned the hard way from sss_faculty)
**Model column types MUST match the live DB exactly.** Before writing any model,
dump the real schema:
```sql
SELECT table_name, column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name LIKE 'vb_%'
ORDER BY table_name, ordinal_position;
```
Match every column. Declaring a column the DB lacks (or wrong type) = 500s.

> **Update, 29 Sep 2026 — the rename happened.** The database is now `vb_prod`
> and every table carries the `vb_` prefix; `dem_prod` no longer exists. The
> models were still pointing at `dem_*` long after the database moved, so the
> backend failed on its first query with *"relation dem_student_master does not
> exist"*. All 17 table names were corrected. The notes below are kept as the
> original conversion plan — read `dem_` as `vb_` throughout.

## Gotchas found in the demo (don't copy blindly)
- `/students/current` returns a **hardcoded** student — replace with a real query by token `user_id` (done in vidyarthi).
- Code writes to `vb_assignment_submissions` which **doesn't exist**; the real
  table is `vb_student_submission`. Use the real one.
- ~~`dem_` prefix kept (renaming `dem_prod` → `vb_` is an optional later migration).~~
  Done — see the note above. The env var is still `DEMO_DATABASE_URL` because the
  branch key is `DEMO`; only the database it points at changed.
- IDs are numeric (bigint/integer) — but `vb_student_learning_profiles` uses
  `integer` while `vb_student_master` uses `bigint`. Match each exactly.

## Backend port pattern (per module)
1. **Models** → `backend/app/db/models/<role>.py`, `__tablename__` = the real
   `vb_` table, types matching the schema, inherit `Base`.
2. **Router** → `backend/app/api/v1/<role>.py`:
   - `router = APIRouter(prefix="/<role>", tags=["<role>"])`
   - Guard every endpoint with `require_role("<Role>")` (from `core.security`)
   - Get the DB with `Depends(get_branch_db)` (from `core.scoping`)
   - Port each demo endpoint's SQL to SQLAlchemy on the models
3. **Register** in `backend/app/api/v1/router.py` (already includes all module names).
4. Compile: `python3 -m py_compile app/api/v1/<role>.py`.

## Web screen pattern (per screen)
1. Copy the demo Next.js screen → `web/app/<role>/<screen>/page.js`.
2. Replace hardcoded colors with the theme tokens in `web/app/globals.css`
   (`var(--saffron)`, `var(--ivory)`, `.vb-card`, `.vb-btn`, …).
3. Convert labels to VidhyaBharathi terminology (Sanskrit + English subtitle,
   like the login).
4. Call the backend via the shared client (`@vb/shared`) with the login token.

## Mobile pattern (per screen)
1. Build the screen in `mobile/src/screens/` using React Native + the theme
   colors (see `LoginScreen.js` / `HomeScreen.js`).
2. Use `@vb/shared` (`api`) + the persistent token (`src/lib/token.js`).
3. Add it to the navigator in `App.js`.
4. Do **Palaka + Vidyarthi first** — parents/students are the real mobile users.

## Definition of done (per module)
- [ ] Models match live schema (compile clean)
- [ ] Router: all endpoints, role-gated, on the branch DB
- [ ] Web screens: moved, themed, Sanskrit terminology, real data
- [ ] Mobile: key screens (if a mobile role)
- [ ] Tested: login → module APIs → web → mobile
