"""Tool definitions (JSON schema format for Claude tool_use) and executor dispatch."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

# ---------------------------------------------------------------------------
# Tool definitions — sent to Claude as tool specs
# ---------------------------------------------------------------------------

TOOL_DEFINITIONS = [
    {
        "name": "search_leads",
        "description": (
            "Search leads in the ProspectOS workspace by name, email, company, or keyword. "
            "Returns a list of matching leads with their score, status, and temperature."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search term (name, email, company name, or keyword)",
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of results to return (default 10)",
                    "default": 10,
                },
            },
            "required": ["query"],
        },
    },
    {
        "name": "get_pipeline_stats",
        "description": (
            "Get a summary of the lead pipeline: counts by status, average score, "
            "temperature distribution, and recent activity."
        ),
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "score_leads",
        "description": (
            "Run AI scoring on a list of leads. "
            "Each lead gets a 0–100 ICP score, a temperature (cold/warm/hot), "
            "and a justification."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "lead_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of lead UUIDs to score",
                },
            },
            "required": ["lead_ids"],
        },
    },
    {
        "name": "enrich_leads",
        "description": "Trigger enrichment on a list of leads (updates company/contact data).",
        "input_schema": {
            "type": "object",
            "properties": {
                "lead_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of lead UUIDs to enrich",
                },
            },
            "required": ["lead_ids"],
        },
    },
]


# ---------------------------------------------------------------------------
# Tool executor
# ---------------------------------------------------------------------------

async def execute_tool(
    name: str,
    tool_input: dict[str, Any],
    workspace_id: uuid.UUID,
    db: AsyncSession,
) -> dict[str, Any]:
    """Dispatch a tool call to the appropriate handler."""
    if name == "search_leads":
        return await _search_leads(tool_input, workspace_id, db)
    elif name == "get_pipeline_stats":
        return await _get_pipeline_stats(workspace_id, db)
    elif name == "score_leads":
        return await _score_leads(tool_input, workspace_id, db)
    elif name == "enrich_leads":
        return await _enrich_leads(tool_input, workspace_id, db)
    else:
        return {"error": f"Unknown tool: {name}"}


# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------

async def _search_leads(
    params: dict, workspace_id: uuid.UUID, db: AsyncSession
) -> dict:
    from sqlalchemy import or_, select
    from app.leads.models import Lead

    query_str = params.get("query", "")
    limit = min(int(params.get("limit", 10)), 25)
    pattern = f"%{query_str}%"

    result = await db.execute(
        select(Lead)
        .where(
            Lead.workspace_id == workspace_id,
            Lead.deleted_at.is_(None),
            or_(
                Lead.email.ilike(pattern),
                Lead.first_name.ilike(pattern),
                Lead.last_name.ilike(pattern),
                Lead.company.ilike(pattern),
            ),
        )
        .limit(limit)
    )
    leads = result.scalars().all()

    return {
        "total": len(leads),
        "leads": [
            {
                "id": str(l.id),
                "name": f"{l.first_name or ''} {l.last_name or ''}".strip(),
                "email": l.email,
                "company": l.company,
                "score": l.score,
                "status": l.status.value if l.status else None,
                "temperature": l.temperature.value if l.temperature else None,
            }
            for l in leads
        ],
    }


async def _get_pipeline_stats(workspace_id: uuid.UUID, db: AsyncSession) -> dict:
    from sqlalchemy import func, select
    from app.leads.models import Lead, LeadStatus

    result = await db.execute(
        select(Lead.status, func.count(Lead.id), func.avg(Lead.score))
        .where(Lead.workspace_id == workspace_id, Lead.deleted_at.is_(None))
        .group_by(Lead.status)
    )
    rows = result.all()

    stats: dict = {"by_status": {}, "total": 0, "avg_score": None}
    total_count = 0
    scores: list[float] = []

    for status, count, avg_score in rows:
        key = status.value if status else "unknown"
        stats["by_status"][key] = count
        total_count += count
        if avg_score is not None:
            scores.append(float(avg_score) * count)

    stats["total"] = total_count
    if scores and total_count:
        stats["avg_score"] = round(sum(scores) / total_count, 1)

    return stats


async def _score_leads(params: dict, workspace_id: uuid.UUID, db: AsyncSession) -> dict:
    from app.leads.service import bulk_action
    from app.leads.schemas import BulkActionRequest

    lead_ids = [uuid.UUID(lid) for lid in params.get("lead_ids", [])]
    if not lead_ids:
        return {"error": "No lead IDs provided"}

    req = BulkActionRequest(lead_ids=lead_ids, action="score")
    result = await bulk_action(db, workspace_id, req)
    return {"scored": result.affected, "action": "score"}


async def _enrich_leads(params: dict, workspace_id: uuid.UUID, db: AsyncSession) -> dict:
    from app.leads.service import bulk_action
    from app.leads.schemas import BulkActionRequest

    lead_ids = [uuid.UUID(lid) for lid in params.get("lead_ids", [])]
    if not lead_ids:
        return {"error": "No lead IDs provided"}

    req = BulkActionRequest(lead_ids=lead_ids, action="enrich")
    result = await bulk_action(db, workspace_id, req)
    return {"enriched": result.affected, "action": "enrich"}
