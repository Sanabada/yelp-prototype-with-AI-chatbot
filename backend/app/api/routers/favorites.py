from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.favorite import Favorite
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.favorite import FavoriteOut

router = APIRouter(prefix="/favorites")


@router.get("", response_model=list[FavoriteOut])
def list_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    return [FavoriteOut(restaurant_id=f.restaurant_id, created_at=str(f.created_at)) for f in favorites]


@router.post("/{restaurant_id}", status_code=201)
def add_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    favorite = Favorite(user_id=current_user.id, restaurant_id=restaurant_id)
    db.add(favorite)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Already favorited")
    return {"message": "Favorited"}


@router.delete("/{restaurant_id}", status_code=204)
def remove_favorite(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorite = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id, Favorite.restaurant_id == restaurant_id)
        .first()
    )
    if not favorite:
        return None

    db.delete(favorite)
    db.commit()
    return None
