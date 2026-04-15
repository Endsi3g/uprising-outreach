import google_auth_oauthlib.flow
from app.config import settings

# Scopes needed for Gmail: Send, Read (for replies), Profile (for identity)
GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
]

def get_google_auth_flow(redirect_uri: str | None = None):
    # Use "installed" for Desktop clients as specified by the user
    flow = google_auth_oauthlib.flow.Flow.from_client_config(
        {
            "installed": {
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=GMAIL_SCOPES,
    )
    flow.redirect_uri = redirect_uri or settings.google_redirect_uri
    return flow

def get_google_auth_url(state: str):
    flow = get_google_auth_flow()
    authorization_url, _ = flow.authorization_url(
        access_type="offline", # Important for getting a refresh token
        include_granted_scopes="true",
        state=state,
        prompt="consent" # Force consent to ensure refresh token is returned
    )
    return authorization_url
