from __future__ import annotations

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class UserPreference(Base):
    __tablename__ = "user_preferences"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    favorite_cuisines: Mapped[str | None] = mapped_column(String(255), nullable=True)
    price_range: Mapped[str | None] = mapped_column(String(10), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="preferences")
