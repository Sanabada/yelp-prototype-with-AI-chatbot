from pydantic import BaseModel, Field, ConfigDict, field_validator


class PreferencesUpdateIn(BaseModel):
    favorite_cuisines: str | list[str] | None = None
    price_range: str | None = Field(default=None, max_length=10)
    cuisine_preferences: list[str] | None = None

    @field_validator("favorite_cuisines", mode="before")
    @classmethod
    def normalize_favorite_cuisines(cls, value):
        if isinstance(value, list):
            return ", ".join(item.strip() for item in value if item and item.strip())
        return value

    @field_validator("cuisine_preferences", mode="before")
    @classmethod
    def pass_through_list(cls, value):
        return value


class PreferencesOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    favorite_cuisines: str | None = None
    price_range: str | None = None
    cuisine_preferences: list[str] | None = None

    @classmethod
    def from_db_obj(cls, pref) -> "PreferencesOut":
        favorite_cuisines = getattr(pref, "favorite_cuisines", None)
        cuisine_preferences = None
        if favorite_cuisines:
            cuisine_preferences = [part.strip() for part in favorite_cuisines.split(",") if part.strip()]
        return cls(
            favorite_cuisines=favorite_cuisines,
            price_range=getattr(pref, "price_range", None),
            cuisine_preferences=cuisine_preferences,
        )
