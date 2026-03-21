from sqlalchemy import String, Text, DateTime, func, ForeignKey, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Restaurant(Base):
    __tablename__ = "restaurants"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    name: Mapped[str] = mapped_column(String(200), index=True)
    cuisine_type: Mapped[str] = mapped_column(String(100), index=True)

    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str] = mapped_column(String(120), index=True)
    state: Mapped[str | None] = mapped_column(String(2), nullable=True)
    country: Mapped[str | None] = mapped_column(String(120), nullable=True)
    zip_code: Mapped[str | None] = mapped_column(String(20), nullable=True)

    contact_phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)

    hours: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    photos: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    price_tier: Mapped[str | None] = mapped_column(String(4), nullable=True)
    keywords: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)

    created_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    owner_id: Mapped[int | None] = mapped_column(ForeignKey("owners.id"), nullable=True, index=True)

    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    created_by = relationship("User", back_populates="restaurants_created")
    owner = relationship("Owner", back_populates="restaurants")
    reviews = relationship("Review", back_populates="restaurant", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="restaurant", cascade="all, delete-orphan")


Index("ix_restaurants_city_zip", Restaurant.city, Restaurant.zip_code)