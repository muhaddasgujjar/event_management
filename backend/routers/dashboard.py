from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

ADMIN_SALES = [models.UserRole.ADMIN, models.UserRole.SALES]


@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_quotes = db.query(models.Quote).count()
    pending_quotes = db.query(models.Quote).filter(models.Quote.status == models.QuoteStatus.PENDING).count()
    reviewing_quotes = db.query(models.Quote).filter(models.Quote.status == models.QuoteStatus.REVIEWING).count()
    approved_quotes = db.query(models.Quote).filter(models.Quote.status == models.QuoteStatus.APPROVED).count()
    rejected_quotes = db.query(models.Quote).filter(models.Quote.status == models.QuoteStatus.REJECTED).count()

    total_events = db.query(models.Event).count()
    upcoming_events = db.query(models.Event).filter(
        models.Event.status == models.EventStatus.SCHEDULED,
        models.Event.start_date > now,
    ).count()
    active_events = db.query(models.Event).filter(models.Event.status == models.EventStatus.IN_PROGRESS).count()
    completed_events = db.query(models.Event).filter(models.Event.status == models.EventStatus.COMPLETED).count()

    total_clients = db.query(models.Client).count()
    new_clients_this_month = db.query(models.Client).filter(models.Client.created_at >= month_start).count()

    unread_contacts = db.query(models.Contact).filter(
        models.Contact.is_read == False,
        models.Contact.is_archived == False,
    ).count()

    total_equipment = db.query(models.Equipment).count()

    revenue_total_result = db.query(func.sum(models.Quote.final_price)).filter(
        models.Quote.final_price != None
    ).scalar()
    revenue_total = float(revenue_total_result or 0)

    revenue_month_result = db.query(func.sum(models.Quote.final_price)).filter(
        models.Quote.final_price != None,
        models.Quote.created_at >= month_start,
    ).scalar()
    revenue_this_month = float(revenue_month_result or 0)

    recent_quotes = (
        db.query(models.Quote)
        .options(joinedload(models.Quote.client))
        .order_by(models.Quote.created_at.desc())
        .limit(5)
        .all()
    )

    upcoming_events_list = (
        db.query(models.Event)
        .filter(
            models.Event.status == models.EventStatus.SCHEDULED,
            models.Event.start_date > now,
        )
        .order_by(models.Event.start_date)
        .limit(5)
        .all()
    )

    return schemas.DashboardStats(
        total_quotes=total_quotes,
        pending_quotes=pending_quotes,
        reviewing_quotes=reviewing_quotes,
        approved_quotes=approved_quotes,
        rejected_quotes=rejected_quotes,
        total_events=total_events,
        upcoming_events=upcoming_events,
        active_events=active_events,
        completed_events=completed_events,
        total_clients=total_clients,
        new_clients_this_month=new_clients_this_month,
        unread_contacts=unread_contacts,
        total_equipment=total_equipment,
        revenue_this_month=revenue_this_month,
        revenue_total=revenue_total,
        recent_quotes=recent_quotes,
        upcoming_events_list=upcoming_events_list,
    )
