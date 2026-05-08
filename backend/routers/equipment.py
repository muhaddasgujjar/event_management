from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/api/equipment", tags=["Equipment"])


@router.get("/", response_model=list[schemas.EquipmentResponse])
def list_equipment(
    category: Optional[models.EquipmentCategory] = Query(None),
    eq_status: Optional[models.EquipmentStatus] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.get_current_active_user),
):
    q = db.query(models.Equipment)
    if category:
        q = q.filter(models.Equipment.category == category)
    if eq_status:
        q = q.filter(models.Equipment.status == eq_status)
    return q.offset(skip).limit(limit).all()


@router.get("/{equipment_id}", response_model=schemas.EquipmentResponse)
def get_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.get_current_active_user),
):
    item = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return item


@router.get("/{equipment_id}/availability", response_model=schemas.EquipmentAvailability)
def check_availability(
    equipment_id: int,
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.get_current_active_user),
):
    item = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")

    # Sum allocated quantities for events overlapping the requested window
    overlapping_events = (
        db.query(models.Event)
        .filter(
            models.Event.start_date <= end_date,
            (models.Event.end_date >= start_date) | (models.Event.end_date == None),
            models.Event.status.in_([models.EventStatus.SCHEDULED, models.EventStatus.IN_PROGRESS]),
        )
        .all()
    )
    event_ids = [e.id for e in overlapping_events]
    allocated = 0
    if event_ids:
        from sqlalchemy import func
        result = (
            db.query(func.sum(models.EventEquipment.quantity_allocated))
            .filter(
                models.EventEquipment.equipment_id == equipment_id,
                models.EventEquipment.event_id.in_(event_ids),
            )
            .scalar()
        )
        allocated = result or 0

    available = item.total_quantity - allocated
    return schemas.EquipmentAvailability(
        equipment_id=equipment_id,
        total_quantity=item.total_quantity,
        allocated_quantity=allocated,
        available_quantity=max(0, available),
        is_available=available > 0,
    )


@router.post("/", response_model=schemas.EquipmentResponse, status_code=status.HTTP_201_CREATED)
def create_equipment(
    eq_in: schemas.EquipmentCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    item = models.Equipment(**eq_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{equipment_id}", response_model=schemas.EquipmentResponse)
def update_equipment(
    equipment_id: int,
    update: schemas.EquipmentUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    item = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")

    for field, value in update.model_dump(exclude_none=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    item = db.query(models.Equipment).filter(models.Equipment.id == equipment_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")
    db.delete(item)
    db.commit()
