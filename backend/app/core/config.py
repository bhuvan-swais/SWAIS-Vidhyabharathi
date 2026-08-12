"""Application settings — SWAIS VidhyaBharathi.

Loads from environment (.env). Nothing secret is committed; .env is gitignored.
"""
import os
from pathlib import Path


def _load_env() -> None:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_env()

# --- Auth ---
SECRET_KEY = os.getenv("SECRET_KEY", "").strip()
ALGORITHM = os.getenv("ALGORITHM", "HS256").strip()
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
# Allow-list of accepted Google OAuth client IDs (web + iOS + Android). The id_token
# 'aud' must be one of these. Falls back to the single GOOGLE_CLIENT_ID.
GOOGLE_CLIENT_IDS = [
    c.strip() for c in os.getenv("GOOGLE_CLIENT_IDS", GOOGLE_CLIENT_ID).split(",") if c.strip()
]

# --- OTP (login via phone) ---
# console = OTP returned in the API response (dev/testing, no SMS gateway yet).
# sms     = send via the configured gateway (DLT-registered Indian gateway — NOT Twilio).
OTP_DELIVERY_MODE = os.getenv("OTP_DELIVERY_MODE", "console").strip().lower()
OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "5"))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))

# Twilio SMS (used when OTP_DELIVERY_MODE=twilio) — same vars as SSS.
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "").strip()

# --- Multi-tenancy: branch (region) -> its own database ---
# One database per branch (BVK1, BVK2, ...). Schools within a branch share the
# tables and are separated by a school_id column. See docs/TENANCY.md.
# Configure one <BRANCH>_DATABASE_URL per branch in .env.
BRANCH_DB_URLS = {
    key[: -len("_DATABASE_URL")]: value
    for key, value in os.environ.items()
    if key.endswith("_DATABASE_URL") and value
}

# --- Stateless AI service (called server-to-server; never exposed publicly) ---
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "").strip()
AI_SERVICE_SECRET = os.getenv("AI_SERVICE_SECRET", "").strip()

# --- Central analytics/billing DB (cross-branch: Nyasa aggregates, AI token metering) ---
CENTRAL_DB_URL = os.getenv("CENTRAL_DATABASE_URL", "").strip()

# --- S3 (private): Granthalaya books/covers, chapter PDFs, worksheets ---
AWS_REGION = os.getenv("AWS_REGION", "").strip()
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET", "").strip()
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID", "").strip()
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY", "").strip()

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").strip()
