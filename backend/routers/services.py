from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/api/services", tags=["Services"])


@router.get("/", response_model=list[schemas.ServiceResponse])
def list_active_services(
    category: Optional[models.ServiceCategory] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.ServiceCatalog).filter(models.ServiceCatalog.is_active == True)
    if category:
        q = q.filter(models.ServiceCatalog.category == category)
    return q.order_by(models.ServiceCatalog.display_order).all()


@router.get("/all", response_model=list[schemas.ServiceResponse])
def list_all_services(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    return db.query(models.ServiceCatalog).order_by(models.ServiceCatalog.display_order).all()


@router.get("/{slug}", response_model=schemas.ServiceResponse)
def get_service_by_slug(slug: str, db: Session = Depends(get_db)):
    service = db.query(models.ServiceCatalog).filter(models.ServiceCatalog.slug == slug).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service


@router.post("/", response_model=schemas.ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(
    service_in: schemas.ServiceCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    if db.query(models.ServiceCatalog).filter(models.ServiceCatalog.slug == service_in.slug).first():
        raise HTTPException(status_code=400, detail="A service with this slug already exists")
    service = models.ServiceCatalog(**service_in.model_dump())
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}", response_model=schemas.ServiceResponse)
def update_service(
    service_id: int,
    update: schemas.ServiceUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    service = db.query(models.ServiceCatalog).filter(models.ServiceCatalog.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    for field, value in update.model_dump(exclude_none=True).items():
        setattr(service, field, value)
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}/toggle", response_model=schemas.ServiceResponse)
def toggle_service_active(
    service_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    service = db.query(models.ServiceCatalog).filter(models.ServiceCatalog.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    service.is_active = not service.is_active
    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    service = db.query(models.ServiceCatalog).filter(models.ServiceCatalog.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(service)
    db.commit()
