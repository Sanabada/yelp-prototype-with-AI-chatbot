from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: str | None = None
    about_me: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    languages: str | None = None
    gender: str | None = None
    profile_photo_url: str | None = None


class UserUpdateIn(BaseModel):
    name: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=30)
    about_me: str | None = Field(default=None, max_length=500)
    city: str | None = Field(default=None, max_length=120)
    state: str | None = Field(default=None, max_length=2)
    country: str | None = Field(default=None, max_length=120)
    languages: str | None = Field(default=None, max_length=200)
    gender: str | None = Field(default=None, max_length=50)
