"""OAuth2 flow helpers for Gmail and Outlook email account connection."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from urllib.parse import urlencode

import httpx
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from jose import JWTError, jwt

from app.config import settings

# ---------------------------------------------------------------------------
# State token — short-lived JWT encoding workspace + user identifiers
# ---------------------------------------------------------------------------

_OAUTH_STATE_EXPIRE_MINUTES = 10
_OAUTH_STATE_TYPE = "oauth_state"


def create_oauth_state(workspace_id: uuid.UUID, user_id: uuid.UUID) -> str:
    """Return a signed JWT to embed in the OAuth `state` parameter."""
    expire = datetime.now(UTC) + timedelta(minutes=_OAUTH_STATE_EXPIRE_MINUTES)
    payload = {
        "workspace_id": str(workspace_id),
        "user_id": str(user_id),
        "type": _OAUTH_STATE_TYPE,
        "exp": expire,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_oauth_state(state: str) -> tuple[uuid.UUID, uuid.UUID]:
    """Decode and validate an OAuth state JWT.

    Returns (workspace_id, user_id).
    Raises ValueError if invalid or expired.
    """
    try:
        payload = jwt.decode(state, settings.secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError(f"Invalid OAuth state: {exc}") from exc

    if payload.get("type") != _OAUTH_STATE_TYPE:
        raise ValueError("Wrong token type in OAuth state")

    return uuid.UUID(payload["workspace_id"]), uuid.UUID(payload["user_id"])


# ---------------------------------------------------------------------------
# Gmail
# ---------------------------------------------------------------------------

_GMAIL_SCOPES = [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
]


def gmail_authorization_url(state: str) -> str:
    """Build the Google OAuth2 consent URL."""
    client_config = {
        "web": {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uris": [settings.google_redirect_uri],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }
    flow = Flow.from_client_config(
        client_config,
        scopes=_GMAIL_SCOPES,
        redirect_uri=settings.google_redirect_uri,
    )
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        prompt="consent",  # always return a refresh_token
        state=state,
    )
    return auth_url


async def gmail_exchange_code(code: str) -> dict:
    """Exchange an auth code for Gmail tokens + user info.

    Returns a dict with keys:
        email, access_token, refresh_token, token_expiry, scopes
    """
    client_config = {
        "web": {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uris": [settings.google_redirect_uri],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }
    flow = Flow.from_client_config(
        client_config,
        scopes=_GMAIL_SCOPES,
        redirect_uri=settings.google_redirect_uri,
    )
    flow.fetch_token(code=code)

    creds: Credentials = flow.credentials

    # Fetch user email via userinfo endpoint
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {creds.token}"},
        )
        resp.raise_for_status()
        user_info = resp.json()

    expiry_iso = creds.expiry.isoformat() if creds.expiry else None
    scopes_str = " ".join(creds.scopes) if creds.scopes else ""

    return {
        "email": user_info["email"],
        "access_token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_expiry": expiry_iso,
        "scopes": scopes_str,
    }


# ---------------------------------------------------------------------------
# Outlook / Microsoft
# ---------------------------------------------------------------------------

_OUTLOOK_SCOPES = [
    "https://graph.microsoft.com/Mail.ReadWrite",
    "https://graph.microsoft.com/Mail.Send",
    "https://graph.microsoft.com/User.Read",
    "offline_access",
]


def _msal_app():  # type: ignore[return]
    import msal  # type: ignore[import]

    return msal.ConfidentialClientApplication(
        client_id=settings.microsoft_client_id,
        client_credential=settings.microsoft_client_secret,
        authority=f"https://login.microsoftonline.com/{settings.microsoft_tenant_id}",
    )


def outlook_authorization_url(state: str) -> str:
    """Build the Microsoft OAuth2 consent URL."""
    params = {
        "client_id": settings.microsoft_client_id,
        "response_type": "code",
        "redirect_uri": settings.microsoft_redirect_uri,
        "scope": " ".join(_OUTLOOK_SCOPES),
        "response_mode": "query",
        "state": state,
        "prompt": "consent",
    }
    base = f"https://login.microsoftonline.com/{settings.microsoft_tenant_id}/oauth2/v2.0/authorize"
    return f"{base}?{urlencode(params)}"


async def outlook_exchange_code(code: str) -> dict:
    """Exchange an auth code for Outlook tokens + user info."""
    app = _msal_app()
    result = app.acquire_token_by_authorization_code(
        code=code,
        scopes=_OUTLOOK_SCOPES,
        redirect_uri=settings.microsoft_redirect_uri,
    )

    if "error" in result:
        raise ValueError(f"Microsoft token exchange failed: {result.get('error_description', result['error'])}")

    access_token: str = result["access_token"]
    refresh_token: str = result.get("refresh_token", "")
    expiry_iso: str = str(result.get("expires_in", ""))

    # Fetch user email from Microsoft Graph
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://graph.microsoft.com/v1.0/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        resp.raise_for_status()
        user_info = resp.json()

    email = user_info.get("mail") or user_info.get("userPrincipalName", "")
    scopes_str = " ".join(_OUTLOOK_SCOPES)

    return {
        "email": email,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_expiry": expiry_iso,
        "scopes": scopes_str,
    }
