from fastapi import APIRouter

from app.api.routers import (
    ai_assistant,
    auth,
    favorites,
    owners,
    preferences,
    restaurants,
    reviews,
    users,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(preferences.router)
api_router.include_router(restaurants.router)
api_router.include_router(reviews.router)
api_router.include_router(favorites.router)
api_router.include_router(owners.router)
api_router.include_router(ai_assistant.router)