import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.companies import service
from app.companies.schemas import CompanyCreate, CompanyResponse, CompanyUpdate
from app.database import get_db
from app.shared.pagination import Page

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("", response_model=Page[CompanyResponse])
async def list_companies(
    cursor: str | None = Query(None),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Page[CompanyResponse]:
    return await service.list_companies(db, current_user.workspace_id, cursor, limit)


@router.post("", response_model=CompanyResponse, status_code=201)
async def create_company(
    payload: CompanyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CompanyResponse:
    company = await service.create_company(db, current_user.workspace_id, payload)
    return CompanyResponse.model_validate(company)


@router.get("/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CompanyResponse:
    company = await service.get_company(db, current_user.workspace_id, company_id)
    return CompanyResponse.model_validate(company)


@router.patch("/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: uuid.UUID,
    payload: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CompanyResponse:
    company = await service.update_company(db, current_user.workspace_id, company_id, payload)
    return CompanyResponse.model_validate(company)


@router.delete("/{company_id}", status_code=204)
async def delete_company(
    company_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_company(db, current_user.workspace_id, company_id)
