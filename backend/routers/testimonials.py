from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/api/testimonials", tags=["Testimonials"])


@router.get("/", response_model=list[schemas.TestimonialResponse])
def list_approved_testimonials(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    return (
        db.query(models.Testimonial)
        .filter(models.Testimonial.is_approved == True)
        .order_by(models.Testimonial.is_featured.desc(), models.Testimonial.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("/", response_model=schemas.TestimonialResponse, status_code=status.HTTP_201_CREATED)
def submit_testimonial(testimonial_in: schemas.TestimonialCreate, db: Session = Depends(get_db)):
    testimonial = models.Testimonial(
        client_name=testimonial_in.client_name,
        company=testimonial_in.company,
        designation=testimonial_in.designation,
        quote_text=testimonial_in.quote_text,
        rating=testimonial_in.rating,
        source=testimonial_in.source,
        is_approved=False,
        is_featured=False,
    )
    db.add(testimonial)
    db.commit()
    db.refresh(testimonial)
    return testimonial


@router.get("/all", response_model=list[schemas.TestimonialResponse])
def list_all_testimonials(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    return (
        db.query(models.Testimonial)
        .order_by(models.Testimonial.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.put("/{testimonial_id}/approve", response_model=schemas.TestimonialResponse)
def approve_testimonial(
    testimonial_id: int,
    approved: bool = True,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    testimonial = db.query(models.Testimonial).filter(models.Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    testimonial.is_approved = approved
    db.commit()
    db.refresh(testimonial)
    return testimonial


@router.put("/{testimonial_id}/feature", response_model=schemas.TestimonialResponse)
def toggle_testimonial_featured(
    testimonial_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    testimonial = db.query(models.Testimonial).filter(models.Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    testimonial.is_featured = not testimonial.is_featured
    db.commit()
    db.refresh(testimonial)
    return testimonial


@router.delete("/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_testimonial(
    testimonial_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    testimonial = db.query(models.Testimonial).filter(models.Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    db.delete(testimonial)
    db.commit()
