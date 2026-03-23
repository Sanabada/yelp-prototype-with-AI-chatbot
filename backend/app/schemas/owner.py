from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class OwnerSignup(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    restaurant_location: str | None = None

    @field_validator("password")
    @classmethod
    def bcrypt_limit(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes (bcrypt limit).")
        return value


class OwnerLoginIn(BaseModel):
    email: EmailStr | None = None
    username: str | None = None
    password: str = Field(min_length=1, max_length=128)


class OwnerLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class OwnerUpdate(BaseModel):
    name: str | None = None
    restaurant_location: str | None = None


class OwnerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    restaurant_location: str | None = None
    created_at: datetime


class OwnerRestaurantCreate(BaseModel):
    name: str
    cuisine_type: str
    city: str
    description: str | None = None
    address: str | None = None
    state: str | None = None
    country: str | None = None
    zip_code: str | None = None
    contact_phone: str | None = None
    contact_email: EmailStr | None = None
    website: str | None = None
    hours: dict = Field(default_factory=dict)
    photos: list[str] = Field(default_factory=list)
    price_tier: str | None = None
    keywords: list[str] = Field(default_factory=list)


class OwnerRestaurantUpdate(BaseModel):
    name: str | None = None
    cuisine_type: str | None = None
    city: str | None = None
    description: str | None = None
    address: str | None = None
    state: str | None = None
    country: str | None = None
    zip_code: str | None = None
    contact_phone: str | None = None
    contact_email: EmailStr | None = None
    website: str | None = None
    hours: dict | None = None
    photos: list[str] | None = None
    price_tier: str | None = None
    keywords: list[str] | None = None


class ReviewReadOnly(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    restaurant_id: int
    user_id: int
    rating: int
    comment: str | None = None
    created_at: datetime | None = None


class OwnerDashboardResponse(BaseModel):
    total_restaurants: int
    total_reviews: int
    average_rating: float
    total_views: int
    recent_reviews: list[ReviewReadOnly]
