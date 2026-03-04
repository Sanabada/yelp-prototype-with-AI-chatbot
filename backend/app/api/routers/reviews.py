from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.api.deps import get_db, get_current_user
from app.models.review import Review
from app.models.restaurant import Restaurant
from app.models.user import User
from app.schemas.review import ReviewCreateIn, ReviewUpdateIn, ReviewOut

router = APIRouter()


@router.get("/restaurants/{restaurant_id}/reviews", response_model=list[ReviewOut])
def list_reviews_for_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    exists = db.get(Restaurant, restaurant_id)
    if not exists:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    reviews = (
        db.query(Review)
        .filter(Review.restaurant_id == restaurant_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    return reviews


@router.post("/restaurants/{restaurant_id}/reviews", response_model=ReviewOut, status_code=201)
def create_review(
    restaurant_id: int,
    payload: ReviewCreateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exists = db.get(Restaurant, restaurant_id)
    if not exists:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    review = Review(
        user_id=current_user.id,
        restaurant_id=restaurant_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="You already reviewed this restaurant (update instead).")

    db.refresh(review)
    return review


@router.put("/reviews/{review_id}", response_model=ReviewOut)
def update_review(
    review_id: int,
    payload: ReviewUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own review")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(review, k, v)

    db.commit()
    db.refresh(review)
    return review


@router.delete("/reviews/{review_id}", status_code=204)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own review")

    db.delete(review)
    db.commit()
    return None