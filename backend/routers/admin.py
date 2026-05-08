from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from calendar import month_abbr
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

@router.get("/users", response_model=list[schemas.UserResponse])
def list_users(
    role: Optional[models.UserRole] = Query(None),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None, description="Search by name or email"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    q = db.query(models.User)
    if role:
        q = q.filter(models.User.role == role)
    if is_active is not None:
        q = q.filter(models.User.is_active == is_active)
    if search:
        q = q.filter(
            (models.User.full_name.ilike(f"%{search}%")) |
            (models.User.email.ilike(f"%{search}%"))
        )
    return q.order_by(models.User.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: schemas.UserAdminCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    if db.query(models.User).filter(models.User.email == user_in.email).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    new_user = models.User(
        email=user_in.email,
        hashed_password=auth.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.get("/users/{user_id}", response_model=schemas.UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    update: schemas.UserAdminUpdate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == current_admin.id:
        if update.is_active is False:
            raise HTTPException(status_code=400, detail="You cannot deactivate your own account")
        if update.role is not None and update.role != models.UserRole.ADMIN:
            raise HTTPException(status_code=400, detail="You cannot change your own admin role")

    if update.full_name is not None:
        user.full_name = update.full_name
    if update.role is not None:
        user.role = update.role
    if update.is_active is not None:
        user.is_active = update.is_active

    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(auth.require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    db.delete(user)
    db.commit()


@router.post("/users/{user_id}/reset-password")
def admin_reset_password(
    user_id: int,
    data: schemas.AdminPasswordReset,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    user.hashed_password = auth.get_password_hash(data.new_password)
    db.commit()
    return {"message": f"Password reset successfully for {user.email}"}


# ─── SUBSCRIBER MANAGEMENT ───────────────────────────────────────────────────

@router.get("/subscribers", response_model=list[schemas.SubscriberResponse])
def list_all_subscribers(
    is_active: Optional[bool] = Query(None),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    q = db.query(models.Subscriber)
    if is_active is not None:
        q = q.filter(models.Subscriber.is_active == is_active)
    return q.order_by(models.Subscriber.subscribed_at.desc()).offset(skip).limit(limit).all()


@router.delete("/subscribers/{sub_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscriber(
    sub_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    sub = db.query(models.Subscriber).filter(models.Subscriber.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    db.delete(sub)
    db.commit()


# ─── SYSTEM OVERVIEW ─────────────────────────────────────────────────────────

@router.get("/overview")
def system_overview(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    return {
        "users": {
            "total": db.query(models.User).count(),
            "admin": db.query(models.User).filter(models.User.role == models.UserRole.ADMIN).count(),
            "sales": db.query(models.User).filter(models.User.role == models.UserRole.SALES).count(),
            "crew": db.query(models.User).filter(models.User.role == models.UserRole.CREW).count(),
            "client": db.query(models.User).filter(models.User.role == models.UserRole.CLIENT).count(),
            "inactive": db.query(models.User).filter(models.User.is_active == False).count(),
        },
        "quotes": {
            "total": db.query(models.Quote).count(),
            "pending": db.query(models.Quote).filter(models.Quote.status == models.QuoteStatus.PENDING).count(),
            "reviewing": db.query(models.Quote).filter(models.Quote.status == models.QuoteStatus.REVIEWING).count(),
            "approved": db.query(models.Quote).filter(models.Quote.status == models.QuoteStatus.APPROVED).count(),
            "rejected": db.query(models.Quote).filter(models.Quote.status == models.QuoteStatus.REJECTED).count(),
        },
        "events": {
            "total": db.query(models.Event).count(),
            "scheduled": db.query(models.Event).filter(models.Event.status == models.EventStatus.SCHEDULED).count(),
            "in_progress": db.query(models.Event).filter(models.Event.status == models.EventStatus.IN_PROGRESS).count(),
            "completed": db.query(models.Event).filter(models.Event.status == models.EventStatus.COMPLETED).count(),
            "cancelled": db.query(models.Event).filter(models.Event.status == models.EventStatus.CANCELLED).count(),
        },
        "clients": db.query(models.Client).count(),
        "equipment": {
            "total": db.query(models.Equipment).count(),
            "smd": db.query(models.Equipment).filter(models.Equipment.category == models.EquipmentCategory.SMD).count(),
            "sound": db.query(models.Equipment).filter(models.Equipment.category == models.EquipmentCategory.SOUND).count(),
            "stall": db.query(models.Equipment).filter(models.Equipment.category == models.EquipmentCategory.STALL_MATERIAL).count(),
        },
        "portfolio": db.query(models.Portfolio).count(),
        "testimonials": {
            "total": db.query(models.Testimonial).count(),
            "approved": db.query(models.Testimonial).filter(models.Testimonial.is_approved == True).count(),
            "pending": db.query(models.Testimonial).filter(models.Testimonial.is_approved == False).count(),
        },
        "contacts": {
            "total": db.query(models.Contact).count(),
            "unread": db.query(models.Contact).filter(
                models.Contact.is_read == False,
                models.Contact.is_archived == False,
            ).count(),
            "archived": db.query(models.Contact).filter(models.Contact.is_archived == True).count(),
        },
        "subscribers": {
            "total": db.query(models.Subscriber).count(),
            "active": db.query(models.Subscriber).filter(models.Subscriber.is_active == True).count(),
        },
        "faqs": db.query(models.FAQ).count(),
        "services": db.query(models.ServiceCatalog).count(),
        "chat_sessions": {
            "total": db.query(models.ChatSession).count(),
            "escalated": db.query(models.ChatSession).filter(models.ChatSession.is_escalated == True).count(),
        },
        "notifications": {
            "total": db.query(models.Notification).count(),
            "unread": db.query(models.Notification).filter(models.Notification.is_read == False).count(),
        },
    }


# ─── REVENUE CHART ───────────────────────────────────────────────────────────

@router.get("/revenue-chart")
def revenue_chart(
    months: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role([models.UserRole.ADMIN, models.UserRole.SALES])),
):
    now = datetime.now(timezone.utc)
    result = []
    for i in range(months - 1, -1, -1):
        target = (now.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
        target_year = target.year
        target_month = target.month

        rev = db.query(func.sum(models.Quote.final_price)).filter(
            models.Quote.final_price != None,
            models.Quote.status == models.QuoteStatus.APPROVED,
            extract("year", models.Quote.created_at) == target_year,
            extract("month", models.Quote.created_at) == target_month,
        ).scalar() or 0.0

        result.append({
            "month": f"{month_abbr[target_month]} {target_year}",
            "revenue": float(rev),
            "year": target_year,
            "month_num": target_month,
        })

    return {"data": result}
