from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.user import User
from app.schemas.restaurant import (
    RestaurantCreateIn, RestaurantUpdateIn,
    RestaurantOut, RestaurantDetailOut
)

router = APIRouter(prefix="/restaurants")


def _restaurant_stats_subq(db: Session):
    return (
        db.query(
            Review.restaurant_id.label("rid"),
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("review_count"),
        )
        .group_by(Review.restaurant_id)
        .subquery()
    )


@router.get("", response_model=list[RestaurantOut])
def list_restaurants(
    db: Session = Depends(get_db),
    name: str | None = Query(default=None),
    cuisine: str | None = Query(default=None),
    keyword: str | None = Query(default=None),
    city_or_zip: str | None = Query(default=None),
    price_tier: str | None = Query(default=None),
    sort_by: str | None = Query(default="rating"),  # rating/popularity/price
    limit: int = Query(default=50, ge=1, le=200),
):
    stats = _restaurant_stats_subq(db)

    q = (
        db.query(Restaurant, stats.c.avg_rating, stats.c.review_count)
        .outerjoin(stats, stats.c.rid == Restaurant.id)
    )

    if name:
        q = q.filter(Restaurant.name.ilike(f"%{name}%"))
    if cuisine:
        q = q.filter(Restaurant.cuisine_type.ilike(f"%{cuisine}%"))
    if city_or_zip:
        q = q.filter(or_(
            Restaurant.city.ilike(f"%{city_or_zip}%"),
            Restaurant.zip_code.ilike(f"%{city_or_zip}%"),
        ))
    if price_tier:
        q = q.filter(Restaurant.price_tier == price_tier)
    if keyword:
        # search in name/description + keyword list (stored as JSON; simplest: description/name)
        q = q.filter(or_(
            Restaurant.name.ilike(f"%{keyword}%"),
            Restaurant.description.ilike(f"%{keyword}%"),
        ))

    # sorting
    if sort_by == "price":
        q = q.order_by(Restaurant.price_tier.asc().nullslast(), Restaurant.name.asc())
    elif sort_by == "popularity":
        q = q.order_by(stats.c.review_count.desc().nullslast(), Restaurant.name.asc())
    else:  # rating
        q = q.order_by(stats.c.avg_rating.desc().nullslast(), Restaurant.name.asc())

    rows = q.limit(limit).all()
    out: list[RestaurantOut] = []
    for r, avg_rating, review_count in rows:
        out.append(RestaurantOut(
            id=r.id,
            name=r.name,
            cuisine_type=r.cuisine_type,
            city=r.city,
            state=r.state,
            country=r.country,
            price_tier=r.price_tier,
            description=r.description,
            avg_rating=float(avg_rating) if avg_rating is not None else None,
            review_count=int(review_count) if review_count is not None else 0,
        ))
    return out


@router.post("", response_model=RestaurantDetailOut, status_code=201)
def create_restaurant(
    payload: RestaurantCreateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = Restaurant(**payload.model_dump(), created_by_user_id=current_user.id)
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return _detail_with_stats(db, restaurant.id)


def _detail_with_stats(db: Session, rid: int) -> RestaurantDetailOut:
    stats = (
        db.query(
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("review_count"),
        )
        .filter(Review.restaurant_id == rid)
        .first()
    )
    restaurant = db.get(Restaurant, rid)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    avg_rating = float(stats.avg_rating) if stats and stats.avg_rating is not None else None
    review_count = int(stats.review_count) if stats else 0

    return RestaurantDetailOut(
        id=restaurant.id,
        name=restaurant.name,
        cuisine_type=restaurant.cuisine_type,
        description=restaurant.description,
        address=restaurant.address,
        city=restaurant.city,
        state=restaurant.state,
        country=restaurant.country,
        zip_code=restaurant.zip_code,
        contact_phone=restaurant.contact_phone,
        contact_email=restaurant.contact_email,
        website=restaurant.website,
        hours=restaurant.hours,
        photos=restaurant.photos,
        price_tier=restaurant.price_tier,
        keywords=restaurant.keywords,
        avg_rating=avg_rating,
        review_count=review_count,
    )


@router.get("/{restaurant_id}", response_model=RestaurantDetailOut)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    return _detail_with_stats(db, restaurant_id)


@router.put("/{restaurant_id}", response_model=RestaurantDetailOut)
def update_restaurant(
    restaurant_id: int,
    payload: RestaurantUpdateIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if restaurant.created_by_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(restaurant, k, v)

    db.commit()
    return _detail_with_stats(db, restaurant_id)


@router.delete("/{restaurant_id}", status_code=204)
def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    restaurant = db.get(Restaurant, restaurant_id)
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    if restaurant.created_by_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    db.delete(restaurant)
    db.commit()
    return None