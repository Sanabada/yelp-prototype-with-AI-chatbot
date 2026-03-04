from pydantic import BaseModel, Field

class PreferencesOut(BaseModel):
    cuisine_preferences: list[str] | None = None
    price_range: str | None = None
    preferred_locations: list[str] | None = None
    search_radius_miles: int | None = None
    dietary_needs: list[str] | None = None
    ambiance_preferences: list[str] | None = None
    sort_preference: str | None = None

class PreferencesUpdateIn(PreferencesOut):
    # reuse same fields
    pass