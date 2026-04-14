"""ARQ worker entry point — register all background tasks here."""

from arq.connections import RedisSettings

from app.config import settings
from app.workers.import_tasks import import_leads_task
from app.workers.inbox_tasks import sync_gmail_inbox


async def startup(ctx: dict) -> None:
    from app.database import AsyncSessionLocal
    ctx["db_factory"] = AsyncSessionLocal


async def shutdown(ctx: dict) -> None:
    pass


class WorkerSettings:
    functions = [
        import_leads_task,
        sync_gmail_inbox,
    ]
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
    max_jobs = 10
    job_timeout = 300
    retry_jobs = True
    max_tries = 3
    on_startup = startup
    on_shutdown = shutdown
    queue_name = "outreach:default"
