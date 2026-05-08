from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/api/contact", tags=["Contact"])

ADMIN_SALES = [models.UserRole.ADMIN, models.UserRole.SALES]


@router.post("/", response_model=schemas.ContactResponse, status_code=status.HTTP_201_CREATED)
def submit_contact(contact_in: schemas.ContactCreate, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else None

    new_contact = models.Contact(
        name=contact_in.name,
        email=contact_in.email,
        phone=contact_in.phone,
        company=contact_in.company,
        message=contact_in.message,
        inquiry_type=contact_in.inquiry_type,
        ip_address=ip,
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)

    notif = models.Notification(
        title="New Contact Form Submission",
        message=f"{contact_in.name} ({contact_in.email}) sent a {contact_in.inquiry_type.value.lower()} inquiry.",
        type=models.NotificationType.CONTACT,
        related_id=new_contact.id,
        related_type="contact",
    )
    db.add(notif)
    db.commit()

    return new_contact


@router.post("/subscribe", response_model=schemas.SubscriberResponse, status_code=status.HTTP_201_CREATED)
def subscribe(sub_in: schemas.SubscriberCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Subscriber).filter(models.Subscriber.email == sub_in.email).first()
    if existing:
        if not existing.is_active:
            existing.is_active = True
            existing.unsubscribed_at = None
            db.commit()
            db.refresh(existing)
        return existing

    subscriber = models.Subscriber(email=sub_in.email, name=sub_in.name)
    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)
    return subscriber


@router.get("/subscribers", response_model=list[schemas.SubscriberResponse])
def list_subscribers(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    return (
        db.query(models.Subscriber)
        .filter(models.Subscriber.is_active == True)
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/", response_model=list[schemas.ContactResponse])
def list_contacts(
    is_read: Optional[bool] = Query(None),
    inquiry_type: Optional[models.InquiryType] = Query(None),
    is_archived: bool = Query(False),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    q = db.query(models.Contact).filter(models.Contact.is_archived == is_archived)
    if is_read is not None:
        q = q.filter(models.Contact.is_read == is_read)
    if inquiry_type:
        q = q.filter(models.Contact.inquiry_type == inquiry_type)
    return q.order_by(models.Contact.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{contact_id}", response_model=schemas.ContactResponse)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.put("/{contact_id}/read", response_model=schemas.ContactResponse)
def mark_contact_read(
    contact_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    contact.is_read = True
    db.commit()
    db.refresh(contact)
    return contact


@router.put("/{contact_id}/archive", response_model=schemas.ContactResponse)
def archive_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    contact.is_archived = True
    contact.is_read = True
    db.commit()
    db.refresh(contact)
    return contact
