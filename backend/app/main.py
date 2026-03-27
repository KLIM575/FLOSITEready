from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import init_db
from .routes import products, orders, auth, search, settings, appearance
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Flower Shop API",
    description="REST API для интернет-магазина цветов",
    version="1.0.0"
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Path("app/uploads").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

app.include_router(products.router)
app.include_router(orders.router)
app.include_router(auth.router)
app.include_router(search.router)
app.include_router(settings.router)
app.include_router(appearance.router)

@app.on_event("startup")
def on_startup():
    init_db()
    from .database import SessionLocal
    from sqlalchemy import text
    db = SessionLocal()
    try:
        db.execute(text("UPDATE orders SET status = LOWER(status) WHERE status != LOWER(status)"))
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "message": "Flower Shop API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
