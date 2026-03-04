import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserOut, UserUpdateIn

router = APIRouter(prefix="/users")


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(
    payload: UserUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    data = payload.model_dump(exclude_unset=True)
    # enforce state abbreviation if provided
    if "state" in data and data["state"] and len(data["state"]) != 2:
        raise HTTPException(status_code=422, detail="State must be 2-letter abbreviation")

    for k, v in data.items():
        setattr(current_user, k, v)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/photo", response_model=UserOut)
def upload_profile_photo(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    file: UploadFile = File(...),
):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=415, detail="Only jpg/jpeg/png/webp allowed")

    name = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, name)

    with open(path, "wb") as f:
        f.write(file.file.read())

    # For prototype: store relative URL/path (frontend can serve it or you expose static route)
    current_user.profile_photo_url = f"/{settings.UPLOAD_DIR}/{name}"
    db.commit()
    db.refresh(current_user)
    return current_user