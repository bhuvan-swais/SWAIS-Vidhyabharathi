"""Login OTP service — SWAIS VidhyaBharathi (Pravesha).

6-digit OTP, stored HASHED (HMAC-SHA256) in the branch DB with expiry + attempt
limits. The table is created on demand so no migration is needed for the demo.

Delivery is pluggable via OTP_DELIVERY_MODE:
  console  the OTP is logged and returned in the API response — dev only
  nimbus   the DLT-registered Indian gateway (also 'sms'); this is production
  twilio   kept for parity with SSS, not used in India

Nimbus wants ten bare digits in Phno, not the E.164 form to_e164() produces,
and the message text must match the DLT template registered against
NIMBUS_TEMPLATE_ID — the gateway rejects anything that differs.
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
    NIMBUS_USER_ID, NIMBUS_PASSWORD, NIMBUS_SENDER_ID,
    NIMBUS_ENTITY_ID, NIMBUS_TEMPLATE_ID, NIMBUS_API_URL,
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


def to_local_10(phone: str) -> str:
    """Ten bare digits, the form Nimbus expects in Phno.

    to_e164() gives +91XXXXXXXXXX, which the gateway rejects — it wants the
    national number on its own.
    """
    digits = "".join(ch for ch in (phone or "") if ch.isdigit())[-10:]
    if len(digits) != 10:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Please enter a valid 10-digit phone number.")
    return digits


def _send_via_nimbus(phone: str, otp: str) -> None:
    """Send through the DLT-registered gateway.

    The message wording is fixed by the DLT template registered against
    NIMBUS_TEMPLATE_ID. Changing this text without re-registering the template
    makes the gateway silently reject the message.
    """
    missing = [
        name for name, value in (
            ("NIMBUS_USER_ID", NIMBUS_USER_ID),
            ("NIMBUS_PASSWORD", NIMBUS_PASSWORD),
            ("NIMBUS_SENDER_ID", NIMBUS_SENDER_ID),
            ("NIMBUS_ENTITY_ID", NIMBUS_ENTITY_ID),
            ("NIMBUS_TEMPLATE_ID", NIMBUS_TEMPLATE_ID),
        ) if not value
    ]
    if missing:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            f"SMS gateway is not configured: {', '.join(missing)} missing.",
        )

    # Must match the DLT template registered against NIMBUS_TEMPLATE_ID
    # character for character, with the OTP in place of {#var}:
    #
    #   Your mobile verification OTP is {#var} for Vidya Bharati School.
    #   It is valid for 10 minutes. Do not share this OTP with anyone.
    #   - SARAF WORLDSPHERE AI SERVICES
    #
    # Edit this text and the template together, never one alone.
    message = (
        f"Your mobile verification OTP is {otp} for Vidya Bharati School. "
        f"It is valid for 10 minutes. Do not share this OTP with anyone. "
        f"- SARAF WORLDSPHERE AI SERVICES"
    )

    params = {
        "UserID": NIMBUS_USER_ID,
        "Password": NIMBUS_PASSWORD,
        "SenderID": NIMBUS_SENDER_ID,
        "Phno": to_local_10(phone),
        "Msg": message,
        "EntityID": NIMBUS_ENTITY_ID,
        "TemplateID": NIMBUS_TEMPLATE_ID,
    }

    try:
        import httpx
        response = httpx.get(NIMBUS_API_URL, params=params, timeout=15)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Nimbus request failed for %s", phone)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"OTP SMS could not be sent: {exc}")

    body = (response.text or "").strip()
    # The gateway answers 200 with a body describing the outcome, so a failure
    # has to be read from the text rather than the status code.
    if response.status_code != 200 or "error" in body.lower() or "invalid" in body.lower():
        logger.error("Nimbus rejected the OTP for %s: HTTP %s %s", phone, response.status_code, body)
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "OTP SMS could not be sent. Please try again.")

    logger.info("OTP sent to %s via Nimbus: %s", phone, body)


def send_otp(phone: str, otp: str) -> None:
    if OTP_DELIVERY_MODE == "console":
        logger.info("OTP for %s = %s (console mode)", phone, otp)
        return

    if OTP_DELIVERY_MODE in ("nimbus", "sms"):
        _send_via_nimbus(phone, otp)
        return

    if OTP_DELIVERY_MODE == "twilio":
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

    raise HTTPException(
        status.HTTP_501_NOT_IMPLEMENTED,
        "SMS delivery not configured. Set OTP_DELIVERY_MODE to console, nimbus or twilio.",
    )


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
