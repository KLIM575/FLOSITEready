from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from .database import init_db
from .routes import products, orders, auth, search, settings, appearance, delivery, stats
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Flower Shop API",
    description="REST API для интернет-магазина цветов",
    version="1.0.0"
)

_default_origins = (
    "http://localhost:5173,http://localhost:5174,"
    "http://127.0.0.1:5173,http://127.0.0.1:5174"
)
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", _default_origins).split(",") if o.strip()]

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
app.include_router(delivery.router)
app.include_router(stats.router)

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

@app.get("/api/health")
def health_check():
    return {"status": "ok"}


_DIST = Path(__file__).resolve().parent.parent.parent / "dist"


def _spa_enabled() -> bool:
    """Раздача Vite-сборки с корня проекта (../dist от backend/app)."""
    has_index = (_DIST / "index.html").is_file()
    flag = os.getenv("SERVE_SPA", "").strip().lower()
    if flag in ("0", "false", "no", "off"):
        return False
    if flag in ("1", "true", "yes", "on"):
        return has_index
    return has_index

if _spa_enabled():
    _assets = _DIST / "assets"
    if _assets.is_dir():
        app.mount("/assets", StaticFiles(directory=str(_assets)), name="spa_assets")

    @app.get("/")
    async def root_spa():
        return FileResponse(_DIST / "index.html")

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        target = (_DIST / full_path).resolve()
        dist_root = _DIST.resolve()
        try:
            target.relative_to(dist_root)
        except ValueError:
            return FileResponse(_DIST / "index.html")
        if target.is_file():
            return FileResponse(target)
        return FileResponse(_DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "message": "Flower Shop API",
            "version": "1.0.0",
            "docs": "/docs",
        }
