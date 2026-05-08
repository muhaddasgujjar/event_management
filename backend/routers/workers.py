from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
import models, schemas, auth
from database import get_db

router = APIRouter(tags=["Workers"])

ADMIN_SALES = [models.UserRole.ADMIN, models.UserRole.SALES]


@router.get("/api/workers/", response_model=list[schemas.UserResponse])
def list_workers(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    return (
        db.query(models.User)
        .filter(models.User.role == models.UserRole.CREW, models.User.is_active == True)
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/api/events/{event_id}/workers", response_model=list[schemas.WorkerAssignmentResponse])
def get_event_workers(
    event_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_role(ADMIN_SALES)),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return (
        db.query(models.WorkerAssignment)
        .options(joinedload(models.WorkerAssignment.user))
        .filter(models.WorkerAssignment.event_id == event_id)
        .all()
    )


@router.post("/api/events/{event_id}/workers", response_model=schemas.WorkerAssignmentResponse, status_code=status.HTTP_201_CREATED)
def assign_worker(
    event_id: int,
    assignment: schemas.WorkerAssignmentCreate,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    worker = db.query(models.User).filter(
        models.User.id == assignment.user_id,
        models.User.role == models.UserRole.CREW,
    ).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found or not a CREW member")

    existing = db.query(models.WorkerAssignment).filter(
        models.WorkerAssignment.event_id == event_id,
        models.WorkerAssignment.user_id == assignment.user_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Worker already assigned to this event")

    new_assignment = models.WorkerAssignment(
        event_id=event_id,
        user_id=assignment.user_id,
        role_description=assignment.role_description,
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)

    # Re-fetch with user relationship
    return (
        db.query(models.WorkerAssignment)
        .options(joinedload(models.WorkerAssignment.user))
        .filter(models.WorkerAssignment.id == new_assignment.id)
        .first()
    )


@router.delete("/api/events/{event_id}/workers/{assignment_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_worker_assignment(
    event_id: int,
    assignment_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(auth.require_admin),
):
    assignment = db.query(models.WorkerAssignment).filter(
        models.WorkerAssignment.id == assignment_id,
        models.WorkerAssignment.event_id == event_id,
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
