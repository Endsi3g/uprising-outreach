import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.companies.models import Company
from app.companies.schemas import CompanyCreate, CompanyResponse, CompanyUpdate
from app.shared.exceptions import raise_not_found
from app.shared.pagination import Page, PageInfo, build_page, decode_cursor, encode_cursor


async def list_companies(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    cursor: str | None,
    limit: int,
) -> Page[CompanyResponse]:
    query = (
        select(Company)
        .where(Company.workspace_id == workspace_id, Company.deleted_at.is_(None))
        .order_by(Company.created_at.desc(), Company.id.desc())
    )

    if cursor:
        created_at, cid = decode_cursor(cursor)
        query = query.where(
            (Company.created_at < created_at)
            | ((Company.created_at == created_at) & (Company.id < cid))
        )

    count_result = await db.execute(
        select(func.count()).select_from(Company).where(
            Company.workspace_id == workspace_id, Company.deleted_at.is_(None)
        )
    )
    total = count_result.scalar_one()

    result = await db.execute(query.limit(limit + 1))
    items = list(result.scalars().all())

    page = build_page(items, limit, total)
    return Page[CompanyResponse](
        data=[CompanyResponse.model_validate(c) for c in page["data"]],
        pagination=page["pagination"],
    )


async def create_company(
    db: AsyncSession, workspace_id: uuid.UUID, payload: CompanyCreate
) -> Company:
    company = Company(workspace_id=workspace_id, **payload.model_dump())
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return company


async def get_company(
    db: AsyncSession, workspace_id: uuid.UUID, company_id: uuid.UUID
) -> Company:
    result = await db.execute(
        select(Company).where(
            Company.id == company_id,
            Company.workspace_id == workspace_id,
            Company.deleted_at.is_(None),
        )
    )
    company = result.scalar_one_or_none()
    if not company:
        raise_not_found("Company", str(company_id))
    return company  # type: ignore[return-value]


async def update_company(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    company_id: uuid.UUID,
    payload: CompanyUpdate,
) -> Company:
    company = await get_company(db, workspace_id, company_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
    await db.commit()
    await db.refresh(company)
    return company


async def delete_company(
    db: AsyncSession, workspace_id: uuid.UUID, company_id: uuid.UUID
) -> None:
    company = await get_company(db, workspace_id, company_id)
    company.deleted_at = datetime.now(UTC)
    await db.commit()
