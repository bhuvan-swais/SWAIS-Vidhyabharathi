# Multi-tenancy — SWAIS VidhyaBharathi

## The model
```
BVK (the product)
 └── Branch  = a region/cluster   →  its OWN database   (BVK1, BVK2, ...)
        └── School = SCH1, SCH2…   →  a school_id COLUMN inside that DB
               └── Users (Vidyarthi / Acharya / Palaka / Pradhana / Nyasa)
```

Two levels of separation:
1. **Database per branch** — strong isolation between regions.
   `BVK1` → `bvk1` DB, `BVK2` → `bvk2` DB. Configured via `<BRANCH>_DATABASE_URL`.
2. **school_id per school** — schools in the same branch share the tables and
   are separated by a `school_id` column on **every** tenant table.

Example:
- Branch **BVK1** (10 schools, `SCH1`..`SCH10`) → database `bvk1`
- Branch **BVK2** (5 schools, `SCH20`..`SCH25`) → database `bvk2`

## How a request resolves
1. Login issues a token: `{ user_id, branch, school_id, role }`.
2. `core/tenancy.get_branch_session(branch)` → session on that branch's DB.
3. `core/scoping.get_scoped_db` → yields `(session, school_id)`.
4. Every query filters by `school_id` (via `scope_query` or the model base).

`Nyasa` (trust) is **branch-level**: `school_id` is `None`, so it sees all
schools in its branch DB.

## THE RULE (non-negotiable)
> Every tenant table has `school_id`. Every query is scoped by it. Never rely on
> a developer to remember `WHERE school_id = ...` — always go through
> `get_scoped_db` / `scope_query`. One missing filter = one school seeing
> another school's data.

Inherit `TenantModel` (in `db/session.py`) for every school-owned table — it
guarantees the `school_id` column exists.

## Endpoint pattern
```python
from fastapi import Depends
from app.core.scoping import get_scoped_db, scope_query
from app.core.security import require_role
from app.db.models.student import Student

@router.get("/students")
def list_students(
    scope = Depends(get_scoped_db),
    user  = Depends(require_role("Acharya", "Pradhana Acharya")),
):
    session, school_id = scope
    q = scope_query(session.query(Student), Student, school_id)
    return q.all()
```

## Adding a new branch
1. Create the database (schema).
2. Add `<BRANCH>_DATABASE_URL` to `backend/.env`.
3. Run migrations against it (see below). No code change.

## Migrations
Schema changes must run on **every** branch DB. A migration script loops over
all `BRANCH_DB_URLS` and applies. Forgetting one breaks that branch.

## Connection limits
Each branch gets its own small pool (`pool_size=3`). The shared DB role is
connection-capped — keep pools small and watch the total as branches grow.

## Central store
`CENTRAL_DATABASE_URL` holds cross-branch data: Nyasa aggregation across
branches and per-school AI token/billing metering (school student data stays in
the branch DBs; only operational/billing data is central).
