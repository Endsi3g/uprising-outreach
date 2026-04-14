# Configuration Guide — ProspectOS

This guide explains how to properly configure your local and production environments for ProspectOS. It covers environment variables, third-party integrations, and default behaviors.

## Environment Variables (.env)

ProspectOS relies on several environment variables. You must copy `.env.example` to `.env` and fill the variables.

### Core Configuration
- `ENVIRONMENT`: Set to `development`, `staging`, or `production`.
- `API_KEY`: Secret string securing backend endpoints.
- `DATABASE_URL`: Connection string to your PostgreSQL instance (e.g., Supabase connection pool URL).
- `ENCRYPTION_KEY`: A Fernet 32-byte url-safe base64-encoded string used for encrypting OAuth tokens.

### Email Providers & OAuth
- `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET`: OAuth2 keys from Google Cloud Console. Required for connecting Gmail inboxes.
- `OUTLOOK_CLIENT_ID` / `OUTLOOK_CLIENT_SECRET`: OAuth2 keys from Azure AD. Required for Microsoft accounts.

### External APIs
- `ANTHROPIC_API_KEY`: Required for the core Claude engine (generating messages, audits, classification).
- `SUPABASE_KEY` & `SUPABASE_URL`: Required if using Supabase for your backend operations.

## Default Policies

- **Delivery limits**: We recommend keeping daily sending limits per mailbox to under 50.
- **DNS validations**: Never bypass the SPF/DKIM/DMARC blocking walls. The UI enforces valid DNS before launching any campaigns.

For any complex config troubleshooting, please refer to the architecture documentation.
