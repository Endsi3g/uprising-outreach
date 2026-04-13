"""Job status polling endpoint for async operations."""

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.auth.models import User

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/{job_id}")
async def get_job_status(
    job_id: str,
    current_user: User = Depends(get_current_user),
) -> dict:
    from arq import create_pool
    from arq.connections import RedisSettings
    from app.config import settings

    redis = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    try:
        data = await redis.hgetall(f"import_job:{job_id}")
        if not data:
            return {"job_id": job_id, "status": "not_found"}

        return {
            "job_id": job_id,
            "status": data.get(b"status", b"unknown").decode(),
            "total": int(data.get(b"total", 0)),
            "processed": int(data.get(b"processed", 0)),
            "skipped": int(data.get(b"skipped", 0)),
            "errors": int(data.get(b"errors", 0)),
        }
    finally:
        await redis.aclose()
