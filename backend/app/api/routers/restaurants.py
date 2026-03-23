from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import case, func, or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.user import User
from app.schemas.restaurant import (
    RestaurantCreateIn,
    RestaurantDetailOut,
    RestaurantOut,
    RestaurantUpdateIn,
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
    sort_by: str | None = Query(default="rating"),
    limit: int = Query(default=50, ge=1, le=200),
):
    stats = _restaurant_stats_subq(db)
    query = db.query(Restaurant, stats.c.avg_rating, stats.c.review_count).outerjoin(
        stats, stats.c.rid == Restaurant.id
    )

    if name:
        query = query.filter(Restaurant.name.ilike(f"%{name}%"))
    if cuisine:
        query = query.filter(Restaurant.cuisine_type.ilike(f"%{cuisine}%"))
    if city_or_zip:
        query = query.filter(
            or_(
                Restaurant.city.ilike(f"%{city_or_zip}%"),
                Restaurant.zip_code.ilike(f"%{city_or_zip}%"),
            )
        )
    if price_tier:
        query = query.filter(Restaurant.price_tier == price_tier)
    if keyword:
        query = query.filter(
            or_(
                Restaurant.name.ilike(f"%{keyword}%"),
                Restaurant.description.ilike(f"%{keyword}%"),
            )
        )

    if sort_by == "price":
        query = query.order_by(
            case((Restaurant.price_tier.is_(None), 1), else_=0),
            Restaurant.price_tier.asc(),
            Restaurant.name.asc(),
        )
    elif sort_by == "popularity":
        query = query.order_by(
            case((stats.c.review_count.is_(None), 1), else_=0),
            stats.c.review_count.desc(),
            Restaurant.name.asc(),
        )
    else:
        query = query.order_by(
            case((stats.c.avg_rating.is_(None), 1), else_=0),
            stats.c.avg_rating.desc(),
            Restaurant.name.asc(),
        )

    rows = query.limit(limit).all()
    return [
        RestaurantOut(
            id=restaurant.id,
            name=restaurant.name,
            cuisine_type=restaurant.cuisine_type,
            city=restaurant.city,
            state=restaurant.state,
            country=restaurant.country,
            price_tier=restaurant.price_tier,
            description=restaurant.description,
            avg_rating=float(avg_rating) if avg_rating is not None else None,
            review_count=int(review_count) if review_count is not None else 0,
            owner_id=restaurant.owner_id,
        )
        for restaurant, avg_rating, review_count in rows
    ]


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
    for key, value in data.items():
        setattr(restaurant, key, value)

    db.commit()
    db.refresh(restaurant)
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


def _detail_with_stats(db: Session, restaurant_id: int) -> RestaurantDetailOut:
    stats = (
        db.query(
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("review_count"),
        )
        .filter(Review.restaurant_id == restaurant_id)
        .first()
    )
    restaurant = db.get(Restaurant, restaurant_id)
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
        owner_id=restaurant.owner_id,
        created_by_user_id=restaurant.created_by_user_id,
    )
