"""Keyset (cursor-based) pagination — never use offset pagination."""
import base64
import json
import uuid
from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PageInfo(BaseModel):
    next_cursor: str | None = None
    has_more: bool = False
    total_count: int = 0


class Page(BaseModel, Generic[T]):
    data: list[T]
    pagination: PageInfo


def encode_cursor(created_at: datetime, id: uuid.UUID) -> str:
    payload = {"created_at": created_at.isoformat(), "id": str(id)}
    return base64.urlsafe_b64encode(json.dumps(payload).encode()).decode()


def decode_cursor(cursor: str) -> tuple[datetime, uuid.UUID]:
    payload = json.loads(base64.urlsafe_b64decode(cursor.encode()))
    return datetime.fromisoformat(payload["created_at"]), uuid.UUID(payload["id"])


def build_page(items: list[Any], limit: int, total_count: int) -> dict[str, Any]:
    has_more = len(items) > limit
    data = items[:limit]

    next_cursor = None
    if has_more and data:
        last = data[-1]
        next_cursor = encode_cursor(last.created_at, last.id)

    return {
        "data": data,
        "pagination": PageInfo(
            next_cursor=next_cursor,
            has_more=has_more,
            total_count=total_count,
        ),
    }
