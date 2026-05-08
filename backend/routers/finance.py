from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas, auth
from database import get_db

router = APIRouter(prefix="/api/finance", tags=["Finance"])


# ─── SUMMARY ────────────────────────────────────────────────────────────────

@router.get("/summary", response_model=schemas.FinanceSummary)
def get_finance_summary(
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    transport_rows = db.query(models.TransportRecord).all()
    transport_count = len(transport_rows)
    transport_total = sum(r.total_amount for r in transport_rows)
    transport_paid = sum(r.total_amount for r in transport_rows if r.payment_status == models.PaymentStatus.PAID)
    transport_pending = transport_total - transport_paid

    smd_rows = db.query(models.SmdFinanceRecord).all()
    smd_count = len(smd_rows)
    smd_total = sum(r.total_amount for r in smd_rows)
    smd_paid = sum(r.total_amount for r in smd_rows if r.payment_status == models.PaymentStatus.PAID)
    smd_pending = smd_total - smd_paid

    stall_rows = db.query(models.StallFabricationRecord).all()
    stall_count = len(stall_rows)
    stall_budget_total = sum(r.total_budget for r in stall_rows)
    stall_collected_total = sum(p.amount for r in stall_rows for p in r.payments)
    stall_shortfall = stall_budget_total - stall_collected_total

    staff_rows = db.query(models.StaffExpense).all()
    staff_count = len(staff_rows)
    staff_total = sum(r.amount for r in staff_rows)

    return schemas.FinanceSummary(
        transport_count=transport_count,
        transport_total=transport_total,
        transport_paid=transport_paid,
        transport_pending=transport_pending,
        smd_count=smd_count,
        smd_total=smd_total,
        smd_paid=smd_paid,
        smd_pending=smd_pending,
        stall_count=stall_count,
        stall_budget_total=stall_budget_total,
        stall_collected_total=stall_collected_total,
        stall_shortfall=stall_shortfall,
        staff_count=staff_count,
        staff_total=staff_total,
    )


# ─── TRANSPORT ───────────────────────────────────────────────────────────────

@router.get("/transport", response_model=list[schemas.TransportRecordResponse])
def list_transport(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    return (
        db.query(models.TransportRecord)
        .order_by(models.TransportRecord.record_date.desc())
        .offset(skip).limit(limit).all()
    )


@router.post("/transport", response_model=schemas.TransportRecordResponse, status_code=status.HTTP_201_CREATED)
def create_transport(
    data: schemas.TransportRecordCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = models.TransportRecord(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/transport/{record_id}", response_model=schemas.TransportRecordResponse)
def update_transport(
    record_id: int,
    data: schemas.TransportRecordUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = db.query(models.TransportRecord).filter(models.TransportRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/transport/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transport(
    record_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = db.query(models.TransportRecord).filter(models.TransportRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()


# ─── SMD SCREEN ──────────────────────────────────────────────────────────────

@router.get("/smd", response_model=list[schemas.SmdFinanceRecordResponse])
def list_smd(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    return (
        db.query(models.SmdFinanceRecord)
        .order_by(models.SmdFinanceRecord.record_date.desc())
        .offset(skip).limit(limit).all()
    )


@router.post("/smd", response_model=schemas.SmdFinanceRecordResponse, status_code=status.HTTP_201_CREATED)
def create_smd(
    data: schemas.SmdFinanceRecordCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = models.SmdFinanceRecord(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/smd/{record_id}", response_model=schemas.SmdFinanceRecordResponse)
def update_smd(
    record_id: int,
    data: schemas.SmdFinanceRecordUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = db.query(models.SmdFinanceRecord).filter(models.SmdFinanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/smd/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_smd(
    record_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = db.query(models.SmdFinanceRecord).filter(models.SmdFinanceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()


# ─── STALL FABRICATION ───────────────────────────────────────────────────────

@router.get("/stall", response_model=list[schemas.StallFabricationRecordResponse])
def list_stall(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    return (
        db.query(models.StallFabricationRecord)
        .order_by(models.StallFabricationRecord.record_date.desc())
        .offset(skip).limit(limit).all()
    )


@router.post("/stall", response_model=schemas.StallFabricationRecordResponse, status_code=status.HTTP_201_CREATED)
def create_stall(
    data: schemas.StallFabricationRecordCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = models.StallFabricationRecord(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/stall/{record_id}", response_model=schemas.StallFabricationRecordResponse)
def update_stall(
    record_id: int,
    data: schemas.StallFabricationRecordUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = db.query(models.StallFabricationRecord).filter(models.StallFabricationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/stall/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stall(
    record_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = db.query(models.StallFabricationRecord).filter(models.StallFabricationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()


@router.get("/stall/{record_id}/payments", response_model=list[schemas.StallPaymentResponse])
def list_stall_payments(
    record_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = db.query(models.StallFabricationRecord).filter(models.StallFabricationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Stall record not found")
    return record.payments


@router.post("/stall/{record_id}/payments", response_model=schemas.StallPaymentResponse, status_code=status.HTTP_201_CREATED)
def add_stall_payment(
    record_id: int,
    data: schemas.StallPaymentCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = db.query(models.StallFabricationRecord).filter(models.StallFabricationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Stall record not found")
    payment = models.StallPayment(record_id=record_id, **data.model_dump())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@router.put("/stall/payments/{payment_id}", response_model=schemas.StallPaymentResponse)
def update_stall_payment(
    payment_id: int,
    data: schemas.StallPaymentUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    payment = db.query(models.StallPayment).filter(models.StallPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(payment, field, value)
    db.commit()
    db.refresh(payment)
    return payment


@router.delete("/stall/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stall_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    payment = db.query(models.StallPayment).filter(models.StallPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(payment)
    db.commit()


# ─── STAFF EXPENSES ──────────────────────────────────────────────────────────

@router.get("/staff", response_model=list[schemas.StaffExpenseResponse])
def list_staff_expenses(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    return (
        db.query(models.StaffExpense)
        .order_by(models.StaffExpense.expense_date.desc())
        .offset(skip).limit(limit).all()
    )


@router.post("/staff", response_model=schemas.StaffExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_staff_expense(
    data: schemas.StaffExpenseCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = models.StaffExpense(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/staff/{record_id}", response_model=schemas.StaffExpenseResponse)
def update_staff_expense(
    record_id: int,
    data: schemas.StaffExpenseUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = db.query(models.StaffExpense).filter(models.StaffExpense.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/staff/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff_expense(
    record_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    record = db.query(models.StaffExpense).filter(models.StaffExpense.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
