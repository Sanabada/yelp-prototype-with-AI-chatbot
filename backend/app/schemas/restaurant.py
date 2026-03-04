from pydantic import BaseModel, Field

class RestaurantCreateIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    cuisine_type: str = Field(min_length=1, max_length=100)
    city: str = Field(min_length=1, max_length=120)

    description: str | None = None
    address: str | None = None
    state: str | None = Field(default=None, max_length=2)
    country: str | None = None
    zip_code: str | None = None

    contact_phone: str | None = None
    contact_email: str | None = None
    website: str | None = None

    hours: dict | None = None
    photos: list[str] | None = None
    price_tier: str | None = Field(default=None, max_length=4)
    keywords: list[str] | None = None

class RestaurantUpdateIn(RestaurantCreateIn):
    name: str | None = Field(default=None, max_length=200)
    cuisine_type: str | None = Field(default=None, max_length=100)
    city: str | None = Field(default=None, max_length=120)

class RestaurantOut(BaseModel):
    id: int
    name: str
    cuisine_type: str
    city: str
    state: str | None = None
    country: str | None = None
    price_tier: str | None = None
    description: str | None = None

    avg_rating: float | None = None
    review_count: int | None = None

class RestaurantDetailOut(BaseModel):
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
    contact_email: str | None = None
    website: str | None = None

    hours: dict | None = None
    photos: list[str] | None = None
    price_tier: str | None = None
    keywords: list[str] | None = None

    avg_rating: float | None = None
    review_count: int | None = None