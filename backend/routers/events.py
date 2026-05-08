from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/api/events", tags=["Events"])

ADMIN_SALES = [models.UserRole.ADMIN, models.UserRole.SALES]
ADMIN_SALES_CREW = [models.UserRole.ADMIN, models.UserRole.SALES, models.UserRole.CREW]

STATUS_COLORS = {
    models.EventStatus.SCHEDULED: "#3B82F6",
    models.EventStatus.IN_PROGRESS: "#F59E0B",
    models.EventStatus.COMPLETED: "#10B981",
    models.EventStatus.CANCELLED: "#EF4444",
}


@router.get("/calendar", response_model=list[schemas.EventCalendarItem])
def get_calendar_events(
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES_CREW)),
):
    q = db.query(models.Event)
    if year:
        q = q.filter(
            models.Event.start_date >= datetime(year, month or 1, 1, tzinfo=timezone.utc)
            if month else
            models.Event.start_date >= datetime(year, 1, 1, tzinfo=timezone.utc)
        )
        if month:
            import calendar
            last_day = calendar.monthrange(year, month)[1]
            q = q.filter(models.Event.start_date <= datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.utc))
        else:
            q = q.filter(models.Event.start_date <= datetime(year, 12, 31, 23, 59, 59, tzinfo=timezone.utc))

    events = q.order_by(models.Event.start_date).all()
    return [
        schemas.EventCalendarItem(
            id=e.id,
            title=e.title,
            start_date=e.start_date,
            end_date=e.end_date,
            status=e.status,
            color=STATUS_COLORS.get(e.status, "#6B7280"),
        )
        for e in events
    ]


@router.get("/", response_model=list[schemas.EventResponse])
def list_events(
    event_status: Optional[models.EventStatus] = Query(None),
    month: Optional[int] = Query(None, ge=1, le=12),
    year: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES_CREW)),
):
    q = db.query(models.Event)
    if event_status:
        q = q.filter(models.Event.status == event_status)
    if year and month:
        import calendar
        last_day = calendar.monthrange(year, month)[1]
        q = q.filter(
            models.Event.start_date >= datetime(year, month, 1, tzinfo=timezone.utc),
            models.Event.start_date <= datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.utc),
        )
    return q.order_by(models.Event.start_date).offset(skip).limit(limit).all()


@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES_CREW)),
):
    event = (
        db.query(models.Event)
        .options(
            joinedload(models.Event.workers).joinedload(models.WorkerAssignment.user),
            joinedload(models.Event.equipment).joinedload(models.EventEquipment.equipment),
        )
        .filter(models.Event.id == event_id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: schemas.EventCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    if event_in.quote_id:
        quote = db.query(models.Quote).filter(models.Quote.id == event_in.quote_id).first()
        if not quote:
            raise HTTPException(status_code=404, detail="Quote not found")
        if quote.event:
            raise HTTPException(status_code=400, detail="An event already exists for this quote")

    new_event = models.Event(
        quote_id=event_in.quote_id,
        title=event_in.title,
        start_date=event_in.start_date,
        end_date=event_in.end_date,
        venue_address=event_in.venue_address,
        client_contact=event_in.client_contact,
        is_internal=event_in.is_internal,
        notes=event_in.notes,
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    notif = models.Notification(
        title="New Event Created",
        message=f"Event '{new_event.title}' has been scheduled for {new_event.start_date.strftime('%d %b %Y')}.",
        type=models.NotificationType.EVENT,
        related_id=new_event.id,
        related_type="event",
    )
    db.add(notif)
    db.commit()

    return new_event


@router.put("/{event_id}", response_model=schemas.EventResponse)
def update_event(
    event_id: int,
    update: schemas.EventUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    for field, value in update.model_dump(exclude_none=True).items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return event


@router.put("/{event_id}/status", response_model=schemas.EventResponse)
def update_event_status(
    event_id: int,
    update: schemas.EventStatusUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    event.status = update.status
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()


# ─── EQUIPMENT ASSIGNMENT ─────────────────────────────────────────────────────

@router.get("/{event_id}/equipment", response_model=list[schemas.EventEquipmentResponse])
def list_event_equipment(
    event_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES_CREW)),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    from sqlalchemy.orm import joinedload
    return (
        db.query(models.EventEquipment)
        .options(joinedload(models.EventEquipment.equipment))
        .filter(models.EventEquipment.event_id == event_id)
        .all()
    )


@router.post("/{event_id}/equipment", response_model=schemas.EventEquipmentResponse, status_code=status.HTTP_201_CREATED)
def assign_equipment_to_event(
    event_id: int,
    assignment: schemas.EventEquipmentCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    from sqlalchemy.orm import joinedload

    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    equipment = db.query(models.Equipment).filter(models.Equipment.id == assignment.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    existing = db.query(models.EventEquipment).filter(
        models.EventEquipment.event_id == event_id,
        models.EventEquipment.equipment_id == assignment.equipment_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="This equipment is already assigned to the event. Use PUT to update quantity.")

    if assignment.quantity_allocated < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")
    if assignment.quantity_allocated > equipment.total_quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Requested quantity ({assignment.quantity_allocated}) exceeds total available ({equipment.total_quantity})"
        )

    new_assignment = models.EventEquipment(
        event_id=event_id,
        equipment_id=assignment.equipment_id,
        quantity_allocated=assignment.quantity_allocated,
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    return (
        db.query(models.EventEquipment)
        .options(joinedload(models.EventEquipment.equipment))
        .filter(models.EventEquipment.id == new_assignment.id)
        .first()
    )


@router.put("/{event_id}/equipment/{assignment_id}", response_model=schemas.EventEquipmentResponse)
def update_event_equipment(
    event_id: int,
    assignment_id: int,
    update: schemas.EventEquipmentUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    from sqlalchemy.orm import joinedload

    assignment = db.query(models.EventEquipment).filter(
        models.EventEquipment.id == assignment_id,
        models.EventEquipment.event_id == event_id,
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Equipment assignment not found")

    equipment = db.query(models.Equipment).filter(models.Equipment.id == assignment.equipment_id).first()
    if update.quantity_allocated < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")
    if update.quantity_allocated > equipment.total_quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Requested quantity ({update.quantity_allocated}) exceeds total available ({equipment.total_quantity})"
        )

    assignment.quantity_allocated = update.quantity_allocated
    db.commit()
    db.refresh(assignment)

    return (
        db.query(models.EventEquipment)
        .options(joinedload(models.EventEquipment.equipment))
        .filter(models.EventEquipment.id == assignment_id)
        .first()
    )


@router.delete("/{event_id}/equipment/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_event_equipment(
    event_id: int,
    assignment_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    assignment = db.query(models.EventEquipment).filter(
        models.EventEquipment.id == assignment_id,
        models.EventEquipment.event_id == event_id,
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Equipment assignment not found")
    db.delete(assignment)
    db.commit()
