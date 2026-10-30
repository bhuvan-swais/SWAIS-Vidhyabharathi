"""Granthalaya development seed script -- SWAIS VidhyaBharathi.

Creates realistic categories, books (active + inactive), book requests,
content reports, an approval, and a report resolution.

Idempotent: re-running skips records that already exist (name/title + school_id).

Usage (from backend/ with virtualenv active):
    python scripts/seed_granthalaya.py [--dry-run]

School-1 data is created via direct DB (same school as the demo login JWT).
School-2 records exist only to verify tenant isolation via the API.
"""
import argparse
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Import config early so _load_env() runs before we build the engine
from app.core.config import BRANCH_DB_URLS

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models.granthalaya import (
    Book, BookCategory, BookRequest, ContentReport, Notification,
)


def _get_session(branch: str):
    url = BRANCH_DB_URLS.get(branch)
    if not url:
        sys.exit(f"No DB URL configured for branch {branch}")
    engine = create_engine(
        url,
        pool_size=1, max_overflow=0,
        pool_pre_ping=False,          # skip pre-ping to avoid extra round-trips
        connect_args={"connect_timeout": 15},  # fail fast if RDS unreachable
    )
    Session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    return Session()

BRANCH   = "DEMO"
SCHOOL1  = "1"
SCHOOL2  = "2"

# teacher_id=6 is the first demo Acharya (used as requested_by / reported_by)
# user_id=1    is the first demo admin  (used as reviewed_by / resolved_by)
ACHARYA_USER_ID = 6
ADMIN_USER_ID   = 1


def _s3key(school_id, kind, slug, ext):
    return f"DEMO/{school_id}/granthalaya/{kind}/{slug}.{ext}"


# ---------------------------------------------------------------------------
# Categories
# ---------------------------------------------------------------------------

CATEGORIES = {
    SCHOOL1: [
        {"name": "Science & Technology",
         "description": "Physics, Chemistry, Biology, General Science, and STEM resources"},
        {"name": "Mathematics & Reasoning",
         "description": "Arithmetic, Algebra, Geometry, Calculus, Vedic Maths, and aptitude"},
        {"name": "History & Social Science",
         "description": "Ancient, Medieval, and Modern Indian History, Civics, Geography"},
        {"name": "Language & Literature",
         "description": "English Grammar, Hindi Sahitya, Tamil, Kannada, and regional literature"},
        {"name": "Environmental Studies",
         "description": "Ecology, Environment, Sustainability, and EVS for all classes"},
    ],
    SCHOOL2: [
        {"name": "Science & Technology",
         "description": "School-2 science -- isolation test"},
        {"name": "General Knowledge",
         "description": "School-2 GK -- isolation test"},
    ],
}


# ---------------------------------------------------------------------------
# Books (built after categories are inserted so we have real category_ids)
# ---------------------------------------------------------------------------

def _books_s1(cat):
    """cat: dict {category_name -> category_id} for school 1."""
    S = SCHOOL1
    sci  = cat.get("Science & Technology")
    math = cat.get("Mathematics & Reasoning")
    hist = cat.get("History & Social Science")
    lang = cat.get("Language & Literature")
    env  = cat.get("Environmental Studies")
    return [
        # Science & Technology -- 3 Active, 1 Inactive
        dict(school_id=S, category_id=sci,
             title="Wings of Fire",
             author="A.P.J. Abdul Kalam", publisher="Universities Press",
             class_level="Class 10", language="English",
             keywords="Kalam,autobiography,science,inspiration,ISRO",
             cover_key=_s3key(S,"cover","wings_of_fire","jpg"),
             pdf_key  =_s3key(S,"pdf",  "wings_of_fire","pdf"),
             download_allowed=True,  status="Active",
             view_count=145, download_count=38),
        dict(school_id=S, category_id=sci,
             title="Concepts of Physics Part I",
             author="H.C. Verma", publisher="Bharati Bhawan",
             class_level="Class 11", language="English",
             keywords="physics,mechanics,optics,thermodynamics,JEE,NEET",
             cover_key=_s3key(S,"cover","hc_verma_physics_1","jpg"),
             pdf_key  =_s3key(S,"pdf",  "hc_verma_physics_1","pdf"),
             download_allowed=False, status="Active",
             view_count=89, download_count=0),
        dict(school_id=S, category_id=sci,
             title="General Science - Lucent's",
             author="Various Authors", publisher="Lucent Publications",
             class_level="General", language="Hindi",
             keywords="science,GK,competitive,SSC,railway,Hindi",
             cover_key=_s3key(S,"cover","lucentscience_hi","jpg"),
             pdf_key  =_s3key(S,"pdf",  "lucentscience_hi","pdf"),
             download_allowed=True,  status="Active",
             view_count=62, download_count=14),
        dict(school_id=S, category_id=sci,
             title="NCERT Science Class 10",
             author="NCERT",
             publisher="National Council of Educational Research and Training",
             class_level="Class 10", language="English",
             keywords="NCERT,science,Class 10,board,curriculum",
             cover_key=None, pdf_key=None,
             download_allowed=False, status="Inactive",
             view_count=12, download_count=0),
        # Mathematics & Reasoning -- all Active
        dict(school_id=S, category_id=math,
             title="Mathematics Class 10 - NCERT",
             author="NCERT",
             publisher="National Council of Educational Research and Training",
             class_level="Class 10", language="English",
             keywords="NCERT,maths,Class 10,algebra,geometry,board",
             cover_key=_s3key(S,"cover","ncert_maths_10","jpg"),
             pdf_key  =_s3key(S,"pdf",  "ncert_maths_10","pdf"),
             download_allowed=True,  status="Active",
             view_count=120, download_count=45),
        dict(school_id=S, category_id=math,
             title="Vedic Mathematics",
             author="Bharati Krishna Tirthaji",
             publisher="Motilal Banarsidass",
             class_level="Class 9", language="English",
             keywords="Vedic,mathematics,mental math,sutras,calculation",
             cover_key=_s3key(S,"cover","vedic_mathematics","jpg"),
             pdf_key  =_s3key(S,"pdf",  "vedic_mathematics","pdf"),
             download_allowed=False, status="Active",
             view_count=54, download_count=0),
        dict(school_id=S, category_id=math,
             title="Quantitative Aptitude for Competitive Examinations",
             author="R.S. Aggarwal",
             publisher="S. Chand Publishing",
             class_level="General", language="English",
             keywords="aptitude,quantitative,competitive,SSC,banking,reasoning",
             cover_key=_s3key(S,"cover","rs_aggarwal_quant","jpg"),
             pdf_key  =_s3key(S,"pdf",  "rs_aggarwal_quant","pdf"),
             download_allowed=True,  status="Active",
             view_count=98, download_count=31),
        # History & Social Science -- 2 Active, 1 Inactive
        dict(school_id=S, category_id=hist,
             title="India After Gandhi",
             author="Ramachandra Guha", publisher="Picador India",
             class_level="Class 12", language="English",
             keywords="India,modern history,independence,democracy,Guha",
             cover_key=_s3key(S,"cover","india_after_gandhi","jpg"),
             pdf_key  =_s3key(S,"pdf",  "india_after_gandhi","pdf"),
             download_allowed=False, status="Active",
             view_count=77, download_count=0),
        dict(school_id=S, category_id=hist,
             title="Our Constitution Explained",
             author="Subhash Kashyap", publisher="National Book Trust",
             class_level="Class 9", language="English",
             keywords="constitution,civics,India,democracy,rights,preamble",
             cover_key=_s3key(S,"cover","constitution_explained","jpg"),
             pdf_key  =_s3key(S,"pdf",  "constitution_explained","pdf"),
             download_allowed=True,  status="Active",
             view_count=43, download_count=9),
        dict(school_id=S, category_id=hist,
             title="Medieval Indian History",
             author="Satish Chandra", publisher="Orient BlackSwan",
             class_level="Class 11", language="English",
             keywords="medieval,Mughal,Sultanate,India,history,Class 11",
             cover_key=None, pdf_key=None,
             download_allowed=False, status="Inactive",
             view_count=8, download_count=0),
        # Language & Literature -- both Active
        dict(school_id=S, category_id=lang,
             title="English Grammar and Composition",
             author="P.C. Wren and H. Martin",
             publisher="S. Chand Publishing",
             class_level="Class 8", language="English",
             keywords="grammar,composition,English,writing,Class 8,sentence",
             cover_key=_s3key(S,"cover","wren_martin_grammar","jpg"),
             pdf_key  =_s3key(S,"pdf",  "wren_martin_grammar","pdf"),
             download_allowed=True,  status="Active",
             view_count=88, download_count=22),
        dict(school_id=S, category_id=lang,
             title="Premchand ki Kahaniyan",
             author="Munshi Premchand", publisher="Rajkamal Prakashan",
             class_level="Class 7", language="Hindi",
             keywords="Premchand,Hindi,kahani,sahitya,Class 7,stories",
             cover_key=_s3key(S,"cover","premchand_kahaniyan","jpg"),
             pdf_key  =_s3key(S,"pdf",  "premchand_kahaniyan","pdf"),
             download_allowed=False, status="Active",
             view_count=51, download_count=0),
        # Environmental Studies -- 1 Active
        dict(school_id=S, category_id=env,
             title="Environment and Ecology",
             author="Majid Husain",
             publisher="McGraw Hill Education India",
             class_level="General", language="English",
             keywords="environment,ecology,climate,biodiversity,UPSC,competitive",
             cover_key=_s3key(S,"cover","env_ecology_majid_husain","jpg"),
             pdf_key  =_s3key(S,"pdf",  "env_ecology_majid_husain","pdf"),
             download_allowed=True,  status="Active",
             view_count=33, download_count=7),
    ]


def _books_s2(cat):
    S = SCHOOL2
    sci = cat.get("Science & Technology")
    gk  = cat.get("General Knowledge")
    return [
        dict(school_id=S, category_id=sci,
             title="[School-2] Physics NCERT Class 11",
             author="NCERT",
             publisher="National Council of Educational Research and Training",
             class_level="Class 11", language="English",
             keywords="school2,physics,NCERT,isolation,test",
             cover_key=_s3key(S,"cover","s2_physics_ncert_11","jpg"),
             pdf_key  =_s3key(S,"pdf",  "s2_physics_ncert_11","pdf"),
             download_allowed=False, status="Active",
             view_count=10, download_count=0),
        dict(school_id=S, category_id=sci,
             title="[School-2] R.D. Sharma Math Class 10",
             author="R.D. Sharma", publisher="Dhanpat Rai Publications",
             class_level="Class 10", language="English",
             keywords="school2,maths,RD Sharma,Class 10,isolation",
             cover_key=_s3key(S,"cover","s2_rd_sharma_10","jpg"),
             pdf_key  =_s3key(S,"pdf",  "s2_rd_sharma_10","pdf"),
             download_allowed=True,  status="Active",
             view_count=5, download_count=2),
        dict(school_id=S, category_id=gk,
             title="[School-2] Hindi Grammar Class 8",
             author="Various", publisher="Rajkamal Prakashan",
             class_level="Class 8", language="Hindi",
             keywords="school2,Hindi,grammar,Class 8,isolation",
             cover_key=None, pdf_key=None,
             download_allowed=False, status="Inactive",
             view_count=0, download_count=0),
    ]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def _upsert_categories(db, school_id, specs, dry):
    """Return {name: category_id} for this school."""
    existing = {c.name: c.category_id
                for c in db.query(BookCategory)
                           .filter(BookCategory.school_id == school_id).all()}
    result = dict(existing)
    for spec in specs:
        name = spec["name"]
        if name in existing:
            print(f"  SKIP  cat [{school_id}] {name!r}  (id={existing[name]})")
        else:
            if dry:
                print(f"  [dry] INSERT cat [{school_id}] {name!r}")
                result[name] = None
            else:
                cat = BookCategory(school_id=school_id, **spec)
                db.add(cat)
                db.flush()
                result[name] = cat.category_id
                print(f"  CREATE cat [{school_id}] {name!r}  id={cat.category_id}")
    return result


def _upsert_books(db, school_id, book_specs, dry):
    existing_titles = {b.title for b in db.query(Book.title)
                                          .filter(Book.school_id == school_id).all()}
    created = 0
    first_active_book_id = None
    for spec in book_specs:
        title = spec["title"]
        if title in existing_titles:
            print(f"  SKIP  book [{school_id}] {title!r}")
            # capture an existing active book with pdf_key for the report seed
            if first_active_book_id is None and spec.get("status") == "Active" and spec.get("pdf_key"):
                existing_book = db.query(Book).filter(
                    Book.school_id == school_id, Book.title == title).first()
                if existing_book:
                    first_active_book_id = existing_book.book_id
        else:
            if dry:
                print(f"  [dry] INSERT book [{school_id}] {title!r}  status={spec['status']}")
            else:
                book = Book(**spec)
                db.add(book)
                db.flush()
                created += 1
                print(f"  CREATE book [{school_id}] {title!r}  "
                      f"id={book.book_id}  status={spec['status']}")
                if first_active_book_id is None and spec.get("status") == "Active" \
                        and spec.get("pdf_key"):
                    first_active_book_id = book.book_id
    return created, first_active_book_id


def _upsert_book_requests(db, school_id, acharya_uid, admin_uid, dry):
    existing = {r.title for r in db.query(BookRequest.title)
                                   .filter(BookRequest.school_id == school_id,
                                           BookRequest.requested_by == acharya_uid).all()}
    requests_data = [
        dict(school_id=school_id, requested_by=acharya_uid,
             title="The Discovery of India",
             author="Jawaharlal Nehru",
             reason="Relevant to Class 12 History. Nehru's primary account of "
                    "pre-independence India is invaluable for students."),
        dict(school_id=school_id, requested_by=acharya_uid,
             title="Maths Olympiad Preparation Guide",
             author="S.L. Loney",
             reason="Students preparing for district-level mathematics olympiads "
                    "need targeted practice problems beyond the syllabus."),
    ]
    req_ids = []
    for spec in requests_data:
        if spec["title"] in existing:
            existing_req = db.query(BookRequest).filter(
                BookRequest.school_id == school_id,
                BookRequest.requested_by == acharya_uid,
                BookRequest.title == spec["title"]).first()
            req_ids.append(existing_req.request_id if existing_req else None)
            print(f"  SKIP  request {spec['title']!r}")
        else:
            if dry:
                print(f"  [dry] INSERT request {spec['title']!r}")
                req_ids.append(None)
            else:
                req = BookRequest(**spec)
                db.add(req)
                db.flush()
                req_ids.append(req.request_id)
                print(f"  CREATE request {spec['title']!r}  id={req.request_id}  status=pending")

    # Approve the first request (if still pending)
    if req_ids and req_ids[0] and not dry:
        req = db.query(BookRequest).filter(BookRequest.request_id == req_ids[0]).first()
        if req and req.status == "pending":
            req.status = "approved"
            req.reviewed_by = admin_uid
            req.reviewed_at = datetime.utcnow()
            notif = Notification(
                school_id=school_id, user_id=acharya_uid,
                type="request_approved",
                message=f"Your book request '{req.title}' was approved.",
            )
            db.add(notif)
            db.flush()
            print(f"  APPROVED request id={req.request_id}  -> notification id={notif.notification_id}")
        elif req:
            print(f"  SKIP  approval: request {req_ids[0]} already {req.status}")

    return req_ids


def _upsert_content_report(db, school_id, book_id, acharya_uid, admin_uid, dry):
    if not book_id:
        print("  SKIP  report: no suitable book found")
        return
    existing = db.query(ContentReport).filter(
        ContentReport.school_id == school_id,
        ContentReport.book_id == book_id,
        ContentReport.reported_by == acharya_uid).first()
    if existing:
        print(f"  SKIP  report id={existing.report_id}  book_id={book_id}")
        rep_id = existing.report_id
        rep_status = existing.status
    elif dry:
        print(f"  [dry] INSERT report on book_id={book_id}")
        return
    else:
        rep = ContentReport(
            school_id=school_id, book_id=book_id, reported_by=acharya_uid,
            reason_category="Outdated Information",
            reason="Chapter 4 references data from 2005 which is significantly "
                   "outdated. The current NCERT edition (2023) has revised this section. "
                   "Please update the PDF to the latest edition.",
        )
        db.add(rep)
        db.flush()
        rep_id = rep.report_id
        rep_status = rep.status
        print(f"  CREATE report id={rep_id}  book_id={book_id}  status=open")

    # Resolve the report (if still open)
    if not dry:
        rep_obj = db.query(ContentReport).filter(ContentReport.report_id == rep_id).first()
        if rep_obj and rep_obj.status == "open":
            rep_obj.status = "resolved"
            rep_obj.resolved_by = admin_uid
            rep_obj.resolved_at = datetime.utcnow()
            notif = Notification(
                school_id=school_id, user_id=acharya_uid,
                type="report_resolved",
                message="Your content report has been reviewed and resolved.",
            )
            db.add(notif)
            db.flush()
            print(f"  RESOLVED report id={rep_id}  -> notification id={notif.notification_id}")
        elif rep_obj:
            print(f"  SKIP  resolve: report {rep_id} already {rep_obj.status}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    dry = args.dry_run

    print("=" * 60)
    print("Granthalaya Development Seed")
    print("=" * 60)

    db = _get_session(BRANCH)
    try:
        # ── School 1: categories ──────────────────────────────────────────
        print(f"\n-- Categories (school {SCHOOL1}) --")
        cat1 = _upsert_categories(db, SCHOOL1, CATEGORIES[SCHOOL1], dry)

        # ── School 2: categories ──────────────────────────────────────────
        print(f"\n-- Categories (school {SCHOOL2} / isolation) --")
        cat2 = _upsert_categories(db, SCHOOL2, CATEGORIES[SCHOOL2], dry)

        # ── School 1: books ───────────────────────────────────────────────
        print(f"\n-- Books (school {SCHOOL1}) --")
        s1_created, active_book_id = _upsert_books(db, SCHOOL1, _books_s1(cat1), dry)

        # ── School 2: books ───────────────────────────────────────────────
        print(f"\n-- Books (school {SCHOOL2} / isolation) --")
        s2_created, _ = _upsert_books(db, SCHOOL2, _books_s2(cat2), dry)

        # ── Book requests + approval ──────────────────────────────────────
        print(f"\n-- Book requests (school {SCHOOL1}) --")
        _upsert_book_requests(db, SCHOOL1, ACHARYA_USER_ID, ADMIN_USER_ID, dry)

        # ── Content report + resolution ───────────────────────────────────
        print(f"\n-- Content report (school {SCHOOL1}) --")
        _upsert_content_report(db, SCHOOL1, active_book_id, ACHARYA_USER_ID, ADMIN_USER_ID, dry)

        if not dry:
            db.commit()
            print("\nCommitted all changes.")
        else:
            db.rollback()
            print("\n(dry-run: no changes committed)")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    print("=" * 60)
    print("Seed complete." if not dry else "Dry-run complete.")
    print("=" * 60)


if __name__ == "__main__":
    main()
