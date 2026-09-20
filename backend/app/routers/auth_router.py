from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.Token)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(
        or_(models.User.email == payload.email, models.User.roll_number == payload.roll_number)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email or roll number already exists.")

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        roll_number=payload.roll_number,
        hashed_password=auth.hash_password(payload.password),
        academic_year=payload.academic_year,
        branch=payload.branch,
        college_name=payload.college_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = auth.create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        or_(models.User.email == payload.identifier, models.User.roll_number == payload.identifier)
    ).first()
    if not user or not auth.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email/roll number or password.")

    token = auth.create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@router.put("/me", response_model=schemas.UserOut)
def update_me(
    payload: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user
