import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from database import engine, Base, settings
from routers import (
    auth, quotes, clients, events, equipment,
    workers, dashboard, contact, portfolio,
    testimonials, faq, chatbot, uploads, notifications,
    admin, services, finance,
)

os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
os.makedirs(f"{settings.UPLOADS_DIR}/quotes", exist_ok=True)
os.makedirs(f"{settings.UPLOADS_DIR}/portfolio", exist_ok=True)

Base.metadata.create_all(bind=engine)

with engine.begin() as conn:
    conn.execute(text("ALTER TABLE IF EXISTS portfolio ADD COLUMN IF NOT EXISTS video_url VARCHAR(500)"))

app = FastAPI(
    title="H&B Event Solution API",
    description="Production API for H&B Event Solution — Premium Event Production in Lahore",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://192.168.100.20:3000",
        "https://hbeventsolution.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOADS_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(quotes.router)
app.include_router(clients.router)
app.include_router(events.router)
app.include_router(equipment.router)
app.include_router(workers.router)
app.include_router(dashboard.router)
app.include_router(contact.router)
app.include_router(portfolio.router)
app.include_router(testimonials.router)
app.include_router(faq.router)
app.include_router(chatbot.router)
app.include_router(uploads.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(services.router)
app.include_router(finance.router)


@app.get("/", tags=["Root"])
def read_root():
    return {
        "company": "H&B Event Solution",
        "tagline": "30 Years of Flawless Event Production in Lahore",
        "api_version": "2.0.0",
        "status": "operational",
        "docs": "/api/docs",
    }


@app.get("/api/health", tags=["Root"])
def health_check():
    return {"status": "healthy", "environment": settings.ENVIRONMENT}
