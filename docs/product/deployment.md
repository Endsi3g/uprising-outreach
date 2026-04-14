# Deployment Guide — ProspectOS (Vercel + Supabase)

This guide provides instructions to deploy ProspectOS online, enabling team collaboration. We use a split deployment architecture: Vercel for the Next.js Frontend and Supabase for the database, auth and potentially backend logic. Or if using FastAPI backend, deploy it to Railway.

## Infrastructure Architecture

1. **Frontend**: Vercel (Next.js Edge Network)
2. **Database**: Supabase (PostgreSQL pg_bouncer, Realtime DB)
3. **Backend API (FastAPI)**: Railway or Render (Python App Service)
4. **Worker / Queue**: Redis instance via Railway

## Step 1: Database Setup (Supabase)

1. Create a new organization and project on [Supabase](https://supabase.com).
2. Note your `Database Password`, `Project URL`, and `Anon key`.
3. Locate the `Transaction Connection String (Pooler)` under Settings > Database. Use this as your `DATABASE_URL` in Railway.
4. Execute the DB Migrations (using `alembic` from your backend) against the Supabase DB string. Ensure the `pgvector` extension is active if used.

## Step 2: Backend Deployment (Railway)

1. Connect your GitHub repository to [Railway](https://railway.app).
2. Create a new service from the `/backend` folder.
3. Configure the start command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Inject all Environment Variables defined in `docs/config/setup-config.md` (e.g. `DATABASE_URL`, `ANTHROPIC_API_KEY`, etc.).
5. Create a secondary **Redis database** service in Railway for ARQ tasks. Link `REDIS_URL` in your API environment.
6. Create an **ARQ Worker** service running from the `/backend` folder. Start command: `arq workers.worker_settings`.

## Step 3: Frontend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com) and import the `/frontend` directory of your GitHub repository.
2. Ensure the Framework Preset is detected as **Next.js**.
3. Set your Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Point this to your new Railway backend URL (e.g. `https://prospectos-api.up.railway.app`).
4. Hit Deploy. Vercel will automatically build the Next.js application and serve it via CDN.

> [!NOTE]
> Make sure CORS is properly configured in the backend's FastAPI `main.py` to allow requests originating from your generated Vercel domain.
