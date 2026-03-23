from fastapi import APIRouter

from app.api.routers.ai_assistant import router as ai_assistant_router
from app.api.routers.auth import router as auth_router
from app.api.routers.favorites import router as favorites_router
from app.api.routers.owners import router as owners_router
from app.api.routers.preferences import router as preferences_router
from app.api.routers.restaurants import router as restaurants_router
from app.api.routers.reviews import router as reviews_router
from app.api.routers.users import router as users_router

api_router = APIRouter()
api_router.include_router(auth_router, tags=["Auth"])
api_router.include_router(users_router, tags=["Users"])
api_router.include_router(preferences_router, tags=["Preferences"])
api_router.include_router(restaurants_router, tags=["Restaurants"])
api_router.include_router(reviews_router, tags=["Reviews"])
api_router.include_router(favorites_router, tags=["Favorites"])
api_router.include_router(owners_router, tags=["Owners"])
api_router.include_router(ai_assistant_router, tags=["AI Assistant"])
