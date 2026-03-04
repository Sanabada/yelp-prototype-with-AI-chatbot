from sqlalchemy import ForeignKey, DateTime, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserPreference(Base):
    __tablename__ = "user_preferences"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)

    cuisine_preferences: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    price_range: Mapped[str | None] = mapped_column(nullable=True)  # $..$$$$
    preferred_locations: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)  # city/zip
    search_radius_miles: Mapped[int | None] = mapped_column(nullable=True)
    dietary_needs: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    ambiance_preferences: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    sort_preference: Mapped[str | None] = mapped_column(nullable=True)  # rating/distance/popularity/price

    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="preferences")