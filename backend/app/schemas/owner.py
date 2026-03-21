from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class OwnerSignup(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=8)
    restaurant_location: Optional[str] = None


class OwnerLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class OwnerUpdate(BaseModel):
    name: Optional[str] = None
    restaurant_location: Optional[str] = None


class OwnerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    restaurant_location: Optional[str] = None
    created_at: datetime


class OwnerRestaurantCreate(BaseModel):
    name: str
    cuisine_type: str
    city: str
    description: str
    address: str
    state: str
    country: str
    zip_code: str
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    website: Optional[str] = None
    hours: dict = Field(default_factory=dict)
    photos: List[str] = Field(default_factory=list)
    price_tier: str
    keywords: List[str] = Field(default_factory=list)


class OwnerRestaurantUpdate(BaseModel):
    name: Optional[str] = None
    cuisine_type: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    website: Optional[str] = None
    hours: Optional[dict] = None
    photos: Optional[List[str]] = None
    price_tier: Optional[str] = None
    keywords: Optional[List[str]] = None


class ReviewReadOnly(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    restaurant_id: int
    user_id: int
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None


class OwnerDashboardResponse(BaseModel):
    total_restaurants: int
    total_reviews: int
    average_rating: float
    total_views: int
    recent_reviews: list