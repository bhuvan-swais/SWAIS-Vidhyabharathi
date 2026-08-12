"""Login OTP service — SWAIS VidhyaBharathi (Pravesha).

6-digit OTP, stored HASHED (HMAC-SHA256) in the branch DB with expiry + attempt
limits. Delivery is pluggable: 'console' returns the OTP in the API response for
dev/testing; 'sms' will call the DLT-registered Indian gateway (NOT Twilio) once
wired. The table is created on demand so no migration is needed for the demo.
"""
import hashlib
import hmac
import logging
import secrets
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import text

from app.core.config import (
    SECRET_KEY, OTP_DELIVERY_MODE, OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS,
    TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER,
)

logger = logging.getLogger("uvicorn.error")

_CREATE = text("""
CREATE TABLE IF NOT EXISTS vb_login_otp_tokens (
    otp_id      BIGSERIAL PRIMARY KEY,
    role        VARCHAR(50)  NOT NULL,
    phone       VARCHAR(20)  NOT NULL,
    otp_hash    VARCHAR(128) NOT NULL,
    attempts    INTEGER      NOT NULL DEFAULT 0,
    is_used     BOOLEAN      NOT NULL DEFAULT FALSE,
    expires_at  TIMESTAMP    NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
)
""")


def _ensure_table(db) -> None:
    db.execute(_CREATE)
    db.commit()


def create_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def _digest(otp: str) -> str:
    return hmac.new((SECRET_KEY or "vb-otp-secret").encode(), otp.encode(), hashlib.sha256).hexdigest()


def store_otp(db, phone: str, role: str, otp: str) -> None:
    _ensure_table(db)
    # invalidate any outstanding OTP for this (role, phone)
    db.execute(text("UPDATE vb_login_otp_tokens SET is_used = TRUE WHERE role = :r AND phone = :p AND is_used = FALSE"),
               {"r": role, "p": phone})
    db.execute(text("""INSERT INTO vb_login_otp_tokens (role, phone, otp_hash, expires_at)
                       VALUES (:r, :p, :h, :e)"""),
               {"r": role, "p": phone, "h": _digest(otp),
                "e": datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)})
    db.commit()


def to_e164(phone: str) -> str:
    """Normalize an Indian phone to E.164 (+91XXXXXXXXXX) — same rule as SSS."""
    v = (phone or "").strip().replace(" ", "").replace("-", "")
    digits = v[1:] if v.startswith("+") else v
    if not digits.isdigit() or not (10 <= len(digits) <= 15):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Please enter a valid phone number.")
    if v.startswith("+"):
        return f"+{digits}"
    if len(digits) == 10:
        return f"+91{digits}"
    return f"+{digits}"


def send_otp(phone: str, otp: str) -> None:
    if OTP_DELIVERY_MODE == "console":
        logger.info("OTP for %s = %s (console mode)", phone, otp)
        return

    if OTP_DELIVERY_MODE in ("twilio", "sms"):
        if not (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER):
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Twilio SMS is not configured.")
        try:
            from twilio.rest import Client
            Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN).messages.create(
                body=f"Your SWAIS VidhyaBharathi OTP is {otp}. It is valid for {OTP_EXPIRY_MINUTES} minutes.",
                from_=TWILIO_PHONE_NUMBER,
                to=to_e164(phone),
            )
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001
            logger.exception("Twilio failed to send OTP SMS to %s", phone)
            raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"OTP SMS could not be sent: {exc}")
        return

    # Production target: DLT-registered Indian SMS gateway (cheaper for bulk).
    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED,
                        "SMS delivery not configured. Use OTP_DELIVERY_MODE=console or twilio.")


def verify_stored_otp(db, phone: str, role: str, otp: str) -> None:
    _ensure_table(db)
    row = db.execute(text("""SELECT otp_id, otp_hash, attempts, expires_at, is_used
                             FROM vb_login_otp_tokens
                             WHERE role = :r AND phone = :p AND is_used = FALSE
                             ORDER BY otp_id DESC LIMIT 1"""),
                     {"r": role, "p": phone}).mappings().first()
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "OTP does not exist. Please request a new one.")
    if row["expires_at"] < datetime.utcnow():
        db.execute(text("UPDATE vb_login_otp_tokens SET is_used = TRUE WHERE otp_id = :i"), {"i": row["otp_id"]})
        db.commit()
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "OTP has expired.")
    if row["attempts"] >= OTP_MAX_ATTEMPTS:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many attempts. Request a new OTP.")
    if not hmac.compare_digest(_digest(otp), row["otp_hash"]):
        db.execute(text("UPDATE vb_login_otp_tokens SET attempts = attempts + 1 WHERE otp_id = :i"), {"i": row["otp_id"]})
        db.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid OTP.")
    db.execute(text("UPDATE vb_login_otp_tokens SET is_used = TRUE WHERE otp_id = :i"), {"i": row["otp_id"]})
    db.commit()
