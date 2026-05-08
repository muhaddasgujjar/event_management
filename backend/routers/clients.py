from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/api/clients", tags=["Clients"])

ADMIN_SALES = [models.UserRole.ADMIN, models.UserRole.SALES]


@router.post("/", response_model=schemas.ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client_in: schemas.ClientCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    if db.query(models.Client).filter(models.Client.email == client_in.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A client with this email already exists")
    client = models.Client(**client_in.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@router.get("/", response_model=list[schemas.ClientResponse])
def list_clients(
    search: Optional[str] = Query(None, description="Search by company name or email"),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    q = db.query(models.Client)
    if search:
        q = q.filter(
            (models.Client.company_name.ilike(f"%{search}%")) |
            (models.Client.email.ilike(f"%{search}%")) |
            (models.Client.contact_person.ilike(f"%{search}%"))
        )
    return q.order_by(models.Client.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{client_id}", response_model=schemas.ClientWithQuotes)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    client = (
        db.query(models.Client)
        .options(joinedload(models.Client.quotes))
        .filter(models.Client.id == client_id)
        .first()
    )
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.put("/{client_id}", response_model=schemas.ClientResponse)
def update_client(
    client_id: int,
    update: schemas.ClientUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    for field, value in update.model_dump(exclude_none=True).items():
        setattr(client, field, value)

    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
