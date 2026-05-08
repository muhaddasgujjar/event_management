from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/api/quotes", tags=["Quotes"])

ADMIN_SALES = [models.UserRole.ADMIN, models.UserRole.SALES]


def _create_notification(db: Session, quote_id: int, client_name: str):
    notif = models.Notification(
        title="New Quote Request",
        message=f"A new quote request has been submitted by {client_name}.",
        type=models.NotificationType.QUOTE,
        related_id=quote_id,
        related_type="quote",
    )
    db.add(notif)


@router.post("/", response_model=schemas.QuoteResponse, status_code=status.HTTP_201_CREATED)
def create_quote(quote_in: schemas.QuoteCreate, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.email == quote_in.email).first()
    if not client:
        client = models.Client(
            company_name=quote_in.company_name,
            contact_person=quote_in.contact_person,
            phone=quote_in.phone,
            email=quote_in.email,
        )
        db.add(client)
        db.commit()
        db.refresh(client)

    parsed_date = None
    if quote_in.event_date:
        try:
            parsed_date = datetime.strptime(quote_in.event_date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    new_quote = models.Quote(
        client_id=client.id,
        event_type=quote_in.event_type,
        event_date=parsed_date,
        venue_details=quote_in.venue_details,
        requires_stall=quote_in.requires_stall,
        stall_requirements=quote_in.stall_requirements,
        requires_smd=quote_in.requires_smd,
        smd_requirements=quote_in.smd_requirements,
        requires_sound=quote_in.requires_sound,
        sound_requirements=quote_in.sound_requirements,
        estimated_budget=quote_in.estimated_budget,
        notes=quote_in.notes,
        status=models.QuoteStatus.PENDING,
    )
    db.add(new_quote)
    db.commit()
    db.refresh(new_quote)

    _create_notification(db, new_quote.id, client.company_name)
    db.commit()

    return new_quote


@router.get("/", response_model=list[schemas.QuoteListResponse])
def list_quotes(
    status: Optional[models.QuoteStatus] = Query(None),
    from_date: Optional[datetime] = Query(None),
    to_date: Optional[datetime] = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    q = db.query(models.Quote).options(joinedload(models.Quote.client))
    if status:
        q = q.filter(models.Quote.status == status)
    if from_date:
        q = q.filter(models.Quote.created_at >= from_date)
    if to_date:
        q = q.filter(models.Quote.created_at <= to_date)
    return q.order_by(models.Quote.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{quote_id}", response_model=schemas.QuoteListResponse)
def get_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    quote = db.query(models.Quote).options(joinedload(models.Quote.client)).filter(models.Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    return quote


@router.put("/{quote_id}/status", response_model=schemas.QuoteResponse)
def update_quote_status(
    quote_id: int,
    update: schemas.QuoteAdminUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    quote = db.query(models.Quote).filter(models.Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    if update.status is not None:
        quote.status = update.status
    if update.internal_notes is not None:
        quote.internal_notes = update.internal_notes
    if update.final_price is not None:
        quote.final_price = update.final_price
    if update.rejection_reason is not None:
        quote.rejection_reason = update.rejection_reason

    db.commit()
    db.refresh(quote)
    return quote


@router.delete("/{quote_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quote(
    quote_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    quote = db.query(models.Quote).filter(models.Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    db.delete(quote)
    db.commit()
