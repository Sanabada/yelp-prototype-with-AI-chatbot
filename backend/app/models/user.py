from sqlalchemy import DateTime, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), index=True)
    password_hash: Mapped[str] = mapped_column(String(255))

    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    about_me: Mapped[str | None] = mapped_column(String(500), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    state: Mapped[str | None] = mapped_column(String(2), nullable=True)
    country: Mapped[str | None] = mapped_column(String(120), nullable=True)
    languages: Mapped[str | None] = mapped_column(String(200), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(50), nullable=True)
    profile_photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())

    preferences = relationship("UserPreference", back_populates="user", uselist=False)
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    restaurants_created = relationship("Restaurant", back_populates="created_by")
