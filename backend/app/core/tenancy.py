"""Branch -> database routing — SWAIS VidhyaBharathi multi-tenancy.

Model (see docs/TENANCY.md):
    BVK (product)
      └── Branch  = region  -> its OWN database   (BVK1, BVK2, ...)
             └── School  = SCH1, SCH2 ...          -> school_id column
                    └── Users (roles)

One engine per branch, created lazily and cached. Keep pools small: the shared
DB role is connection-capped, and pools multiply per branch.
"""
from functools import lru_cache

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import BRANCH_DB_URLS, CENTRAL_DB_URL

_factories: dict = {}


def _factory(branch: str):
    if branch not in _factories:
        url = BRANCH_DB_URLS.get(branch)
        if not url:
            raise ValueError(f"Unknown branch (no DB configured): {branch}")
        engine = create_engine(url, pool_size=3, max_overflow=2, pool_pre_ping=True)
        _factories[branch] = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    return _factories[branch]


def get_branch_session(branch: str):
    """A DB session connected to the given branch's database."""
    return _factory(branch)()


@lru_cache(maxsize=1)
def _central_factory():
    if not CENTRAL_DB_URL:
        raise ValueError("CENTRAL_DATABASE_URL is not configured")
    engine = create_engine(CENTRAL_DB_URL, pool_size=3, max_overflow=2, pool_pre_ping=True)
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_central_session():
    """Cross-branch store: Nyasa aggregation + AI token/billing metering."""
    return _central_factory()()
