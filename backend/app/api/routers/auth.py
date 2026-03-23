from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginIn, SignupIn, TokenOut
from app.schemas.user import UserOut
from sqlalchemy import or_

router = APIRouter(prefix="/auth")


@router.post("/signup", response_model=UserOut, status_code=201)
def signup(payload: SignupIn, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.email == payload.email).first()
    if exists:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenOut)
async def login(request: Request, db: Session = Depends(get_db)):
    content_type = (request.headers.get("content-type") or "").lower()

    username_or_email = None
    password = None

    if "application/json" in content_type:
        payload = LoginIn.model_validate(await request.json())
        username_or_email = payload.email or payload.username
        password = payload.password
    else:
        form = await request.form()
        username_or_email = form.get("username") or form.get("email")
        password = form.get("password")

    if not username_or_email or not password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Login requires username/email and password",
        )

    user = (
    db.query(User)
    .filter(
        or_(
            User.email == username_or_email,
            User.name == username_or_email,
        )
    )
    .first()
)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(subject=str(user.id))
    return TokenOut(access_token=token, token_type="bearer")


@router.post("/login/form", response_model=TokenOut, include_in_schema=False)
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = (
    db.query(User)
    .filter(
        or_(
            User.email == form_data.username,
            User.name == form_data.username,
        )
    )
    .first()
)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(subject=str(user.id))
    return TokenOut(access_token=token, token_type="bearer")


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
