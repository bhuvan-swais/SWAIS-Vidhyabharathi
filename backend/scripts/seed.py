"""
Seed script — creates the demo Acharya account used by the frontend.
Run once after migrations: python scripts/seed.py

Credentials:
  email: sandipani.acharya@vidhyabharathi.edu
  password: password123
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from app.db.session import SessionLocal
from app.models.user import UserMaster
from app.models.acharya import VbAcharya
from app.core.security import get_password_hash


def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        existing = db.query(UserMaster).filter(UserMaster.login_id == "sandipani.acharya@vidhyabharathi.edu").first()
        if existing:
            print("✅ Seed data already exists — skipping.")
            return

        # 1. Create base UserMaster record
        user = UserMaster(
            login_id="sandipani.acharya@vidhyabharathi.edu",
            password_hash=get_password_hash("password123"),
            first_name="Acharya Sandipani",
            email_id="sandipani.acharya@vidhyabharathi.edu",
            school_id=1, # Assign to School Tenant 1
            is_active=True,
        )
        db.add(user)
        db.flush()  # get user_id

        # 2. Create multi-tenant VbAcharya profile
        acharya = VbAcharya(
            user_id=user.user_id,
            school_id=1, # Bind to School Tenant 1
            full_name="Acharya Sandipani",
            email_id="sandipani.acharya@vidhyabharathi.edu",
            subject_name="Social Studies",
            class_id=8,
            section_1="A",
            is_active=True,
        )
        db.add(acharya)
        db.commit()

        print(f"✅ Seeded Acharya: sandipani.acharya@vidhyabharathi.edu / password123")
        print(f"   user_id={user.user_id}, acharya_id={acharya.id}, school_id={acharya.school_id}")
    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()