from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.preference import UserPreference
from app.models.restaurant import Restaurant
from app.models.review import Review
from app.models.favorite import Favorite


def run():
    db: Session = SessionLocal()

    # 1) create user if not exists
    u = db.query(User).filter(User.email == "demo@yelp.com").first()
    if not u:
        u = User(name="Demo User", email="demo@yelp.com", password_hash=hash_password("DemoPass123"))
        db.add(u)
        db.commit()
        db.refresh(u)

    # 2) preferences
    pref = db.get(UserPreference, u.id)
    if not pref:
        pref = UserPreference(
            user_id=u.id,
            cuisine_preferences=["Italian", "Mexican"],
            price_range="$$",
            preferred_locations=["San Jose", "Santa Clara"],
            search_radius_miles=10,
            dietary_needs=["vegetarian"],
            ambiance_preferences=["casual"],
            sort_preference="rating",
        )
        db.add(pref)
        db.commit()

    # 3) restaurants
    r1 = db.query(Restaurant).filter(Restaurant.name == "Pasta Paradise").first()
    if not r1:
        r1 = Restaurant(
            name="Pasta Paradise",
            cuisine_type="Italian",
            city="San Jose",
            state="CA",
            country="USA",
            price_tier="$$",
            description="Cozy Italian spot with handmade pasta.",
            keywords=["romantic", "wifi"],
            created_by_user_id=u.id,
        )
        db.add(r1)

    r2 = db.query(Restaurant).filter(Restaurant.name == "Green Leaf Café").first()
    if not r2:
        r2 = Restaurant(
            name="Green Leaf Café",
            cuisine_type="Vegan",
            city="Santa Clara",
            state="CA",
            country="USA",
            price_tier="$",
            description="100% vegan menu, casual seating.",
            keywords=["casual", "family-friendly"],
            created_by_user_id=u.id,
        )
        db.add(r2)

    db.commit()
    db.refresh(r1)
    db.refresh(r2)

    # 4) review (one per restaurant per user)
    for rid, rating, comment in [
        (r1.id, 5, "Amazing pasta and great service!"),
        (r2.id, 4, "Healthy vegan options, nice vibe."),
    ]:
        existing = db.query(Review).filter(Review.user_id == u.id, Review.restaurant_id == rid).first()
        if not existing:
            db.add(Review(user_id=u.id, restaurant_id=rid, rating=rating, comment=comment))
    db.commit()

    # 5) favorite
    existing_fav = db.query(Favorite).filter(Favorite.user_id == u.id, Favorite.restaurant_id == r1.id).first()
    if not existing_fav:
        db.add(Favorite(user_id=u.id, restaurant_id=r1.id))
        db.commit()

    db.close()
    print("✅ Seed completed.")


if __name__ == "__main__":
    run()