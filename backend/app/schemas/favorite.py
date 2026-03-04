from pydantic import BaseModel

class FavoriteOut(BaseModel):
    restaurant_id: int
    created_at: str