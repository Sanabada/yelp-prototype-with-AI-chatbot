from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.owner_security import (
    create_owner_access_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.owner import Owner
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.schemas.owner import (
    OwnerDashboardResponse,
    OwnerLoginResponse,
    OwnerOut,
    OwnerRestaurantCreate,
    OwnerRestaurantUpdate,
    OwnerSignup,
    OwnerUpdate,
    ReviewReadOnly,
)

router = APIRouter(prefix="/owners", tags=["Owners"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/owners/login")


def get_current_owner(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Owner:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid owner authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        if payload.get("role") != "owner":
            raise credentials_error
        owner_id = int(payload.get("sub"))
    except Exception:
        raise credentials_error

    owner = db.query(Owner).filter(Owner.id == owner_id).first()
    if not owner:
        raise credentials_error
    return owner


def get_owned_restaurant_or_404(
    restaurant_id: int,
    owner: Owner,
    db: Session,
) -> Restaurant:
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if restaurant.owner_id != owner.id:
        raise HTTPException(status_code=403, detail="You do not own this restaurant")

    return restaurant


@router.post("/signup", response_model=OwnerOut, status_code=201)
def owner_signup(payload: OwnerSignup, db: Session = Depends(get_db)):
    existing = db.query(Owner).filter(Owner.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Owner email already registered")

    owner = Owner(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        restaurant_location=payload.restaurant_location,
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return owner


@router.post("/login", response_model=OwnerLoginResponse)
def owner_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    owner = db.query(Owner).filter(Owner.email == form_data.username).first()
    if not owner or not verify_password(form_data.password, owner.password_hash):
        raise HTTPException(status_code=401, detail="Invalid owner email or password")

    access_token = create_owner_access_token(owner.id, owner.email)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=OwnerOut)
def get_owner_me(current_owner: Owner = Depends(get_current_owner)):
    return current_owner


@router.put("/me", response_model=OwnerOut)
def update_owner_me(
    payload: OwnerUpdate,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(current_owner, key, value)

    db.commit()
    db.refresh(current_owner)
    return current_owner


@router.post("/restaurants", status_code=201)
def create_owner_restaurant(
    payload: OwnerRestaurantCreate,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurant = Restaurant(
        owner_id=current_owner.id,
        name=payload.name,
        cuisine_type=payload.cuisine_type,
        city=payload.city,
        description=payload.description,
        address=payload.address,
        state=payload.state.upper()[:2],
        country=payload.country,
        zip_code=payload.zip_code,
        contact_phone=payload.contact_phone,
        contact_email=payload.contact_email,
        website=payload.website,
        hours=payload.hours,
        photos=payload.photos,
        price_tier=payload.price_tier,
        keywords=payload.keywords,
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.put("/restaurants/{restaurant_id}")
def update_owner_restaurant(
    restaurant_id: int,
    payload: OwnerRestaurantUpdate,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurant = get_owned_restaurant_or_404(restaurant_id, current_owner, db)
    data = payload.model_dump(exclude_unset=True)

    if "state" in data and data["state"]:
        data["state"] = data["state"].upper()[:2]

    for key, value in data.items():
        setattr(restaurant, key, value)

    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.post("/restaurants/{restaurant_id}/claim")
def claim_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if restaurant.owner_id and restaurant.owner_id != current_owner.id:
        raise HTTPException(status_code=409, detail="Restaurant already claimed by another owner")

    restaurant.owner_id = current_owner.id
    db.commit()
    db.refresh(restaurant)
    return {"message": "Restaurant claimed successfully", "restaurant_id": restaurant.id}


@router.get("/restaurants/{restaurant_id}/reviews", response_model=List[ReviewReadOnly])
def get_owned_restaurant_reviews(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurant = get_owned_restaurant_or_404(restaurant_id, current_owner, db)

    reviews = (
        db.query(Review)
        .filter(Review.restaurant_id == restaurant.id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return reviews


@router.get("/dashboard", response_model=OwnerDashboardResponse)
def owner_dashboard(
    db: Session = Depends(get_db),
    current_owner: Owner = Depends(get_current_owner),
):
    restaurants = db.query(Restaurant).filter(Restaurant.owner_id == current_owner.id).all()
    restaurant_ids = [r.id for r in restaurants]

    if not restaurant_ids:
        return {
            "total_restaurants": 0,
            "total_reviews": 0,
            "average_rating": 0.0,
            "total_views": 0,
            "recent_reviews": [],
        }

    total_reviews, average_rating = (
        db.query(func.count(Review.id), func.avg(Review.rating))
        .filter(Review.restaurant_id.in_(restaurant_ids))
        .one()
    )

    recent_reviews = (
        db.query(Review)
        .filter(Review.restaurant_id.in_(restaurant_ids))
        .order_by(Review.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "total_restaurants": len(restaurants),
        "total_reviews": int(total_reviews or 0),
        "average_rating": round(float(average_rating or 0.0), 2),
        "total_views": 0,
        "recent_reviews": [
            {
                "id": r.id,
                "restaurant_id": r.restaurant_id,
                "user_id": r.user_id,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at,
            }
            for r in recent_reviews
        ],
    }