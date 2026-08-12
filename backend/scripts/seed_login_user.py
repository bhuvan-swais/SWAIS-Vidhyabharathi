"""Seed login credentials onto a demo student — SWAIS VidhyaBharathi.

Feeds an email (for Google Sign-In) and a mobile (for OTP) onto a student row in
the DEMO branch (dem_prod) so that role can actually log in. Mirrors how SSS logs
in against real rows in the school tables — here we just set those columns.

Releases the email/phone from any other student first (unique constraints), then
pins them onto the target so you land on that student's (populated) dashboard.

Usage (from backend/, with the venv/deps that can reach the DB):
    python scripts/seed_login_user.py --student-id 6 \
        --email bhuvan.k59@gmail.com --phone 8977757371
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import create_engine, text  # noqa: E402
from app.core.config import BRANCH_DB_URLS  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--student-id", type=int, required=True)
    ap.add_argument("--email", required=True)
    ap.add_argument("--phone", required=True)
    ap.add_argument("--branch", default="DEMO")
    args = ap.parse_args()

    url = BRANCH_DB_URLS.get(args.branch)
    if not url:
        sys.exit(f"No DB configured for branch {args.branch} (check <BRANCH>_DATABASE_URL in .env)")

    engine = create_engine(url, connect_args={"connect_timeout": 10})
    with engine.begin() as conn:
        conn.execute(text("UPDATE dem_student_master SET email_id = NULL WHERE email_id = :e AND student_id <> :i"),
                     {"e": args.email, "i": args.student_id})
        conn.execute(text("UPDATE dem_student_master SET mobile_no = NULL WHERE mobile_no = :p AND student_id <> :i"),
                     {"p": args.phone, "i": args.student_id})
        res = conn.execute(text("""UPDATE dem_student_master SET email_id = :e, mobile_no = :p
                                   WHERE student_id = :i RETURNING student_id, full_name"""),
                           {"e": args.email, "p": args.phone, "i": args.student_id}).first()
    if not res:
        sys.exit(f"Student {args.student_id} not found")
    print(f"Seeded student {res[0]} ({res[1]}) -> email={args.email}, phone={args.phone}")


if __name__ == "__main__":
    main()
