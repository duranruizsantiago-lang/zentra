"""
VendIA — AI Sales Agent for E-commerce
Main application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import health, webhooks, dashboard, test_chat
from app.models.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    print("🚀 VendIA starting...")
    await init_db()
    yield
    print("👋 Shutting down...")


app = FastAPI(
    title="VendIA",
    description="AI Sales Agent for E-commerce — WhatsApp automation powered by Claude",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS for dashboard frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router)
app.include_router(webhooks.router, prefix="/webhooks")
app.include_router(dashboard.router, prefix="/api")
app.include_router(test_chat.router, prefix="/test")  # Remove in production
