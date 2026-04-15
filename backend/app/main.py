import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.shared.exceptions import AppError

logging.basicConfig(level=settings.log_level.upper())
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title="ProspectOS API",
        version="0.1.0",
        docs_url="/api/docs" if settings.is_development else None,
        redoc_url="/api/redoc" if settings.is_development else None,
    )
    
    # ── Prometheus ────────────────────────────────────────────────────────────
    from prometheus_fastapi_instrumentator import Instrumentator
    Instrumentator().instrument(app).expose(app)

    # ── CORS ──────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Audit log (fires after mutating requests) ─────────────────────────────
    from app.middleware.audit_log import AuditLogMiddleware
    app.add_middleware(AuditLogMiddleware)

    # ── Exception handlers ────────────────────────────────────────────────────
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": exc.code, "message": exc.message, "details": exc.details}},
        )

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred", "details": {}}},
        )

    # ── Health check ──────────────────────────────────────────────────────────
    @app.get("/health", tags=["system"])
    async def health() -> dict:
        return {"status": "ok"}

    # ── Routers (registered as modules are built) ─────────────────────────────
    from app.auth.router import router as auth_router
    app.include_router(auth_router, prefix="/api/v1")

    from app.workspaces.router import router as workspace_router
    app.include_router(workspace_router, prefix="/api/v1")

    from app.leads.router import router as leads_router
    app.include_router(leads_router, prefix="/api/v1")

    from app.companies.router import router as companies_router
    app.include_router(companies_router, prefix="/api/v1")

    from app.contacts.router import router as contacts_router
    app.include_router(contacts_router, prefix="/api/v1")

    from app.senders.router import router as senders_router
    app.include_router(senders_router, prefix="/api/v1")

    from app.jobs.router import router as jobs_router
    app.include_router(jobs_router, prefix="/api/v1")

    from app.customization.router import router as customization_router
    app.include_router(customization_router, prefix="/api/v1")

    from app.projects.router import router as projects_router
    app.include_router(projects_router, prefix="/api/v1")

    from app.ai.router import router as ai_router
    app.include_router(ai_router, prefix="/api/v1")

    return app


app = create_app()
