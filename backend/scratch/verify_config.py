import os
from dotenv import load_dotenv
from app.config import settings

load_dotenv()

print(f"GOOGLE_CLIENT_ID: {settings.google_client_id[:10]}...")
print(f"GOOGLE_REDIRECT_URI: {settings.google_redirect_uri}")
print(f"GOOGLE_API_KEY set: {bool(settings.google_api_key)}")

if settings.google_client_id and settings.google_client_secret:
    print("✅ Configuration loaded successfully.")
else:
    print("❌ Configuration missing.")
