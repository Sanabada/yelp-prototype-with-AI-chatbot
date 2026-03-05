import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Yelp Prototype backend: Auth, Users, Preferences, Restaurants, Reviews, Favorites",
)

# ✅ Root route AFTER app is created
@app.get("/")
def root():
    return {"message": "Yelp Prototype API is running", "docs": "/docs"}

# CORS (adjust origins for your frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Ensure uploads folder exists before mounting
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Serve uploaded files (profile pics) during dev
app.mount(f"/{settings.UPLOAD_DIR}", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(api_router)