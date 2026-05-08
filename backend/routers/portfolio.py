from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])


@router.get("/featured", response_model=list[schemas.PortfolioResponse])
def get_featured_portfolio(db: Session = Depends(get_db)):
    return (
        db.query(models.Portfolio)
        .filter(models.Portfolio.is_featured == True)
        .order_by(models.Portfolio.display_order)
        .all()
    )


@router.get("/", response_model=list[schemas.PortfolioResponse])
def list_portfolio(
    category: Optional[models.PortfolioCategory] = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    q = db.query(models.Portfolio)
    if category:
        q = q.filter(models.Portfolio.category == category)
    return q.order_by(models.Portfolio.display_order, models.Portfolio.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{portfolio_id}", response_model=schemas.PortfolioResponse)
def get_portfolio_item(portfolio_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return item


@router.post("/", response_model=schemas.PortfolioResponse, status_code=status.HTTP_201_CREATED)
def create_portfolio_item(
    item_in: schemas.PortfolioCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    item = models.Portfolio(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{portfolio_id}", response_model=schemas.PortfolioResponse)
def update_portfolio_item(
    portfolio_id: int,
    update: schemas.PortfolioUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    item = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")

    for field, value in update.model_dump(exclude_none=True).items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.put("/{portfolio_id}/feature", response_model=schemas.PortfolioResponse)
def toggle_featured(
    portfolio_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    item = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    item.is_featured = not item.is_featured
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio_item(
    portfolio_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    item = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    db.delete(item)
    db.commit()
