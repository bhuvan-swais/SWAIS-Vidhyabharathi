"""Tenant scoping — the safety net that prevents cross-school data leaks.

RULE: every table has a `school_id`, and every query is filtered by it. Do NOT
rely on developers to remember `WHERE school_id = ...` — get the scoped session
from here, which resolves the branch DB and the school_id from the login token.

Use `Depends(get_scoped_db)` in endpoints. It yields:
    (session, school_id)  -- session is connected to the caller's branch DB.

For normal roles, `school_id` is set and you MUST filter by it. For branch-level
roles (Nyasa), `school_id` is None -> the caller may read all schools in the
branch. Enforce the filter in your queries or, better, in the model base class.
"""
from fastapi import Depends

from app.core.security import get_current_user, BRANCH_LEVEL_ROLES
from app.core.tenancy import get_branch_session


def get_scoped_db(user: dict = Depends(get_current_user)):
    """Yield a (session, school_id) scoped to the caller's branch + school.

    school_id is None for branch-level roles (Nyasa) — they see the whole branch.
    """
    session = get_branch_session(user["branch"])
    school_id = None if user.get("role") in BRANCH_LEVEL_ROLES else user.get("school_id")
    try:
        yield session, school_id
    finally:
        session.close()


def get_branch_db(user: dict = Depends(get_current_user)):
    """Yield just the branch DB session (no school_id scoping).

    For modules whose tables do NOT carry a direct school_id column — e.g. the
    imported DEMO tables, which scope to a school indirectly via class_id. Real
    BVK tables should use get_scoped_db instead.
    """
    session = get_branch_session(user["branch"])
    try:
        yield session
    finally:
        session.close()


def scope_query(query, model, school_id):
    """Apply the school_id filter unless the caller is branch-level (school_id None).

    Example:
        q = session.query(Student)
        q = scope_query(q, Student, school_id)
    """
    if school_id is None:
        return query  # branch-level (Nyasa): all schools in this branch
    return query.filter(model.school_id == school_id)
