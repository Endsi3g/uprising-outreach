"""Unit tests for keyset pagination utilities."""

import uuid
from datetime import UTC, datetime

from app.shared.pagination import build_page, decode_cursor, encode_cursor


def test_encode_decode_cursor_roundtrip():
    now = datetime.now(UTC)
    uid = uuid.uuid4()
    cursor = encode_cursor(now, uid)
    decoded_dt, decoded_id = decode_cursor(cursor)
    assert decoded_id == uid
    # Datetime precision may differ slightly due to isoformat roundtrip
    assert abs((decoded_dt - now).total_seconds()) < 0.001


def test_build_page_has_more():
    class FakeItem:
        def __init__(self, created_at, id):
            self.created_at = created_at
            self.id = id

    now = datetime.now(UTC)
    items = [FakeItem(now, uuid.uuid4()) for _ in range(6)]

    page = build_page(items, limit=5, total_count=10)

    assert page["pagination"].has_more is True
    assert page["pagination"].next_cursor is not None
    assert len(page["data"]) == 5
    assert page["pagination"].total_count == 10


def test_build_page_no_more():
    class FakeItem:
        def __init__(self, created_at, id):
            self.created_at = created_at
            self.id = id

    now = datetime.now(UTC)
    items = [FakeItem(now, uuid.uuid4()) for _ in range(3)]

    page = build_page(items, limit=25, total_count=3)

    assert page["pagination"].has_more is False
    assert page["pagination"].next_cursor is None
    assert len(page["data"]) == 3


def test_build_page_empty():
    page = build_page([], limit=25, total_count=0)
    assert page["pagination"].has_more is False
    assert page["pagination"].next_cursor is None
    assert page["data"] == []
