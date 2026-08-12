"""Google Sign-In verification — SWAIS VidhyaBharathi (Pravesha).

Verifies a Google id_token's signature/expiry and that its audience is one of our
allowed client IDs (web + iOS + Android) and its email matches the login email.
If no client IDs are configured, verification is skipped (dev/demo) so email/OTP
login keeps working — Google simply activates once GOOGLE_CLIENT_ID(S) is set.
"""
from fastapi import HTTPException, status

from app.core.config import GOOGLE_CLIENT_IDS


def google_configured() -> bool:
    return bool(GOOGLE_CLIENT_IDS)


def verify_google_token(google_token: str, email: str) -> None:
    if not GOOGLE_CLIENT_IDS:
        return  # not configured -> skip (email/OTP still enforce identity)

    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
    except ImportError:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR,
                            "google-auth is not installed on the server.")

    try:
        # audience=None -> verify signature + expiry, then check aud against our allow-list.
        payload = id_token.verify_oauth2_token(google_token, google_requests.Request())
    except ValueError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Google authentication failed.")

    if payload.get("aud") not in GOOGLE_CLIENT_IDS:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Google token was issued for a different app.")

    if str(payload.get("email", "")).lower() != email.lower():
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Google account does not match the login email.")
