import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.contacts import service
from app.contacts.schemas import ContactCreate, ContactResponse, ContactUpdate
from app.database import get_db
from app.shared.pagination import Page

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("", response_model=Page[ContactResponse])
async def list_contacts(
    cursor: str | None = Query(None),
    limit: int = Query(25, ge=1, le=100),
    company_id: uuid.UUID | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Page[ContactResponse]:
    return await service.list_contacts(db, current_user.workspace_id, cursor, limit, company_id)


@router.post("", response_model=ContactResponse, status_code=201)
async def create_contact(
    payload: ContactCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ContactResponse:
    contact = await service.create_contact(db, current_user.workspace_id, payload)
    return ContactResponse.model_validate(contact)


@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ContactResponse:
    contact = await service.get_contact(db, current_user.workspace_id, contact_id)
    return ContactResponse.model_validate(contact)


@router.patch("/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: uuid.UUID,
    payload: ContactUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ContactResponse:
    contact = await service.update_contact(db, current_user.workspace_id, contact_id, payload)
    return ContactResponse.model_validate(contact)


@router.delete("/{contact_id}", status_code=204)
async def delete_contact(
    contact_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await service.delete_contact(db, current_user.workspace_id, contact_id)
