from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Favorite(Base):
    __tablename__ = "favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "restaurant_id", name="uq_fav_user_restaurant"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurants.id"), index=True)
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="favorites")
    restaurant = relationship("Restaurant", back_populates="favorites")
