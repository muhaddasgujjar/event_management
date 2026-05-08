from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

ADMIN_SALES = [models.UserRole.ADMIN, models.UserRole.SALES]


@router.get("/count", response_model=schemas.UnreadCount)
def get_unread_count(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    count = db.query(models.Notification).filter(models.Notification.is_read == False).count()
    return schemas.UnreadCount(unread=count)


@router.get("/", response_model=list[schemas.NotificationResponse])
def list_notifications(
    unread_only: bool = Query(False),
    skip: int = 0,
    limit: int = 30,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    q = db.query(models.Notification)
    if unread_only:
        q = q.filter(models.Notification.is_read == False)
    return q.order_by(models.Notification.created_at.desc()).offset(skip).limit(limit).all()


@router.put("/read-all", status_code=status.HTTP_200_OK)
def mark_all_read(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    db.query(models.Notification).filter(models.Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


@router.put("/{notification_id}/read", response_model=schemas.NotificationResponse)
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    notif = db.query(models.Notification).filter(models.Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif
