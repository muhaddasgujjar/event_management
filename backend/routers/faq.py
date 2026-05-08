from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/api/faq", tags=["FAQ"])


@router.get("/", response_model=list[schemas.FAQResponse])
def list_active_faqs(db: Session = Depends(get_db)):
    return (
        db.query(models.FAQ)
        .filter(models.FAQ.is_active == True)
        .order_by(models.FAQ.display_order)
        .all()
    )


@router.post("/", response_model=schemas.FAQResponse, status_code=status.HTTP_201_CREATED)
def create_faq(
    faq_in: schemas.FAQCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    faq = models.FAQ(**faq_in.model_dump())
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq


@router.put("/{faq_id}", response_model=schemas.FAQResponse)
def update_faq(
    faq_id: int,
    update: schemas.FAQUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    faq = db.query(models.FAQ).filter(models.FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    for field, value in update.model_dump(exclude_none=True).items():
        setattr(faq, field, value)

    db.commit()
    db.refresh(faq)
    return faq


@router.put("/{faq_id}/reorder", response_model=schemas.FAQResponse)
def reorder_faq(
    faq_id: int,
    reorder: schemas.FAQReorder,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    faq = db.query(models.FAQ).filter(models.FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    faq.display_order = reorder.display_order
    db.commit()
    db.refresh(faq)
    return faq


@router.delete("/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faq(
    faq_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    faq = db.query(models.FAQ).filter(models.FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    db.delete(faq)
    db.commit()
