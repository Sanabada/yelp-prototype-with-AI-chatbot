from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RestaurantBase(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    cuisine_type: str | None = Field(default=None, min_length=1, max_length=100)
    city: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    address: str | None = None
    state: str | None = Field(default=None, max_length=2)
    country: str | None = None
    zip_code: str | None = None
    contact_phone: str | None = None
    contact_email: EmailStr | None = None
    website: str | None = None
    hours: dict | None = None
    photos: list[str] | None = None
    price_tier: str | None = Field(default=None, max_length=4)
    keywords: list[str] | None = None


class RestaurantCreateIn(RestaurantBase):
    name: str = Field(min_length=1, max_length=200)
    cuisine_type: str = Field(min_length=1, max_length=100)
    city: str = Field(min_length=1, max_length=120)


class RestaurantUpdateIn(RestaurantBase):
    pass


class RestaurantOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    cuisine_type: str
    city: str
    state: str | None = None
    country: str | None = None
    price_tier: str | None = None
    description: str | None = None
    avg_rating: float | None = None
    review_count: int = 0
    owner_id: int | None = None


class RestaurantDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    cuisine_type: str
    description: str | None = None
    address: str | None = None
    city: str
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
    avg_rating: float | None = None
    review_count: int = 0
    owner_id: int | None = None
    created_by_user_id: int | None = None
