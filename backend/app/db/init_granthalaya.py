"""Granthalaya table initialization — SWAIS VidhyaBharathi.

Creates exactly 6 vb_* tables in the target branch database.
Safe to run on a live database:
  - Uses checkfirst=True: SKIPS tables that already exist (never drops/alters).
  - Only touches the 6 tables in GRANTHALAYA_TABLES.
  - Never modifies dem_* tables.

Usage (from backend/ with virtualenv active):
    python -m app.db.init_granthalaya           # creates tables in DEMO branch
    python -m app.db.init_granthalaya --dry-run  # prints DDL only, no DB changes
    python -m app.db.init_granthalaya --branch BVK1
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.schema import CreateTable

# Import models so they register with Base before create_all is called.
# Only granthalaya models need to be created; dem_* models are imported here
# only to ensure Base is fully populated so FK resolution works.
from app.db.session import Base
from app.db.models import granthalaya as _gl_models  # noqa: F401 — registers all models
from app.db.models.granthalaya import (
    BookCategory, Book, BookRequest, ContentReport, ReadingActivity, Notification,
)
from app.core.config import BRANCH_DB_URLS

# Explicit list of ONLY the Granthalaya tables — create_all will touch nothing else.
GRANTHALAYA_TABLES = [
    BookCategory.__table__,
    Book.__table__,
    BookRequest.__table__,
    ContentReport.__table__,
    ReadingActivity.__table__,
    Notification.__table__,
]

# FK dependency order (also the creation order SQLAlchemy will use):
#   vb_book_category → vb_book → vb_content_report
#                             → vb_reading_activity
#   (vb_book_request, vb_notification have no FK constraints)


def _print_ddl_offline() -> None:
    """Print DDL without any database connection (for preview/approval)."""
    from sqlalchemy.dialects import postgresql
    print("=== DDL that will be executed (PostgreSQL) ===")
    print("Tables: only the 6 listed below. dem_* tables: NEVER touched.")
    print()
    for t in GRANTHALAYA_TABLES:
        ddl = str(CreateTable(t).compile(dialect=postgresql.dialect())).strip()
        print(ddl)
        print(";")
        print()
    print("=== checkfirst=True: each CREATE will be SKIPPED if the table already exists ===")
    print("=== No database changes made yet ===")


def main() -> None:
    ap = argparse.ArgumentParser(description="Initialize Granthalaya tables")
    ap.add_argument("--branch", default="DEMO", help="Branch code (default: DEMO)")
    ap.add_argument("--dry-run", action="store_true",
                    help="Print DDL only — no connection, no DB changes")
    args = ap.parse_args()

    # ---- Dry-run: print DDL and exit (no connection needed) ----
    if args.dry_run:
        _print_ddl_offline()
        return

    url = BRANCH_DB_URLS.get(args.branch)
    if not url:
        sys.exit(
            f"No database URL configured for branch '{args.branch}'.\n"
            f"Set {args.branch}_DATABASE_URL in backend/.env"
        )

    engine = create_engine(url, connect_args={"connect_timeout": 10})

    # ---- Verify connection ----
    try:
        with engine.connect() as conn:
            db_name = conn.execute(text("SELECT current_database()")).scalar()
            db_user = conn.execute(text("SELECT current_user")).scalar()
        print(f"Connected  → database: {db_name}, user: {db_user}")
    except Exception as exc:
        sys.exit(f"Cannot connect to {args.branch} database: {exc}")

    # ---- Show existing tables ----
    inspector = inspect(engine)
    existing = set(inspector.get_table_names())
    dem_count = sum(1 for t in existing if t.startswith("dem_"))
    vb_existing = sorted(t for t in existing if t.startswith("vb_"))

    print(f"Existing dem_* tables (WILL NOT TOUCH): {dem_count}")
    print(f"Existing vb_* tables: {vb_existing or ['none']}")
    print()

    # ---- Show what will happen ----
    print("Granthalaya tables — planned actions:")
    all_skip = True
    for t in GRANTHALAYA_TABLES:
        if t.name in existing:
            print(f"  SKIP    {t.name}  (already exists)")
        else:
            print(f"  CREATE  {t.name}")
            all_skip = False
    print()

    if all_skip:
        print("All Granthalaya tables already exist. Nothing to do.")
        return

    # ---- Create tables ----
    print("Creating tables…")
    Base.metadata.create_all(bind=engine, tables=GRANTHALAYA_TABLES, checkfirst=True)

    # ---- Verify result ----
    inspector = inspect(engine)
    after = set(inspector.get_table_names())
    print()
    print("Result:")
    all_ok = True
    for t in GRANTHALAYA_TABLES:
        ok = t.name in after
        print(f"  {'OK' if ok else 'MISSING'}  {t.name}")
        if not ok:
            all_ok = False

    if all_ok:
        print()
        print("All 6 Granthalaya tables created successfully.")
    else:
        print()
        sys.exit("Some tables were not created — check the errors above.")


if __name__ == "__main__":
    main()
