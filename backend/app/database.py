from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./flower_shop.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _run_schema_migrations():
    """Добавляет колонки в существующие таблицы (SQLite/Postgres)."""
    from sqlalchemy import inspect, text

    try:
        insp = inspect(engine)
        dialect = engine.dialect.name
        float_sql = "REAL" if dialect == "sqlite" else "DOUBLE PRECISION"
        str_sql = "VARCHAR" if dialect == "sqlite" else "VARCHAR(255)"

        if "orders" in insp.get_table_names():
            cols = {c["name"] for c in insp.get_columns("orders")}
            with engine.begin() as conn:
                if "delivery_zone_id" not in cols:
                    conn.execute(text(f"ALTER TABLE orders ADD COLUMN delivery_zone_id {str_sql}"))
                if "delivery_fee" not in cols:
                    conn.execute(text(f"ALTER TABLE orders ADD COLUMN delivery_fee {float_sql} DEFAULT 0"))

        if "shipping_addresses" in insp.get_table_names():
            cols = {c["name"] for c in insp.get_columns("shipping_addresses")}
            with engine.begin() as conn:
                if "delivery_zone_name" not in cols:
                    conn.execute(text(f"ALTER TABLE shipping_addresses ADD COLUMN delivery_zone_name {str_sql}"))
    except Exception:
        pass


def init_db():
    from . import models  # noqa: F401 — регистрация моделей в metadata

    Base.metadata.create_all(bind=engine)
    _run_schema_migrations()
