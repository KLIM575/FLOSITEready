from datetime import datetime, timedelta
from typing import Any, List, Tuple
import uuid

from sqlalchemy import func, case
from sqlalchemy.orm import Session

from .. import models

# Совпадает с app.seed_demo_stats.DEMO_MARKER_PATH — не учитывать в отчётах
_DEMO_MARKER_PATH = "__demo_marker__"


def _page_views_scope():
    return models.PageView.path != _DEMO_MARKER_PATH


def _cutoff_utc(days: int) -> datetime:
    return datetime.utcnow() - timedelta(days=days)


def record_pageview(db: Session, path: str) -> None:
    pv = models.PageView(
        id=str(uuid.uuid4()),
        path=path[:500],
        created_at=datetime.utcnow(),
    )
    db.add(pv)
    db.commit()


def get_sales_stats(db: Session, days: int) -> dict:
    cutoff = _cutoff_utc(days)
    day_col = func.date(models.Order.created_at)
    revenue_expr = case(
        (models.Order.status == "cancelled", 0.0),
        else_=models.Order.total_amount,
    )

    total_orders = (
        db.query(func.count(models.Order.id))
        .filter(models.Order.created_at >= cutoff)
        .scalar()
    ) or 0

    revenue_total = (
        db.query(func.sum(revenue_expr))
        .filter(models.Order.created_at >= cutoff)
        .scalar()
    )
    if revenue_total is None:
        revenue_total = 0.0
    else:
        revenue_total = float(revenue_total)

    by_day_rows: List[Tuple[Any, int, float]] = (
        db.query(
            day_col,
            func.count(models.Order.id),
            func.sum(revenue_expr),
        )
        .filter(models.Order.created_at >= cutoff)
        .group_by(day_col)
        .order_by(day_col)
        .all()
    )

    by_day = [
        {
            "date": row[0].isoformat() if hasattr(row[0], "isoformat") else str(row[0]),
            "order_count": int(row[1]),
            "revenue": float(row[2] or 0),
        }
        for row in by_day_rows
    ]

    status_rows = (
        db.query(models.Order.status, func.count(models.Order.id))
        .filter(models.Order.created_at >= cutoff)
        .group_by(models.Order.status)
        .all()
    )
    by_status = [
        {"status": str(s), "count": int(c)} for s, c in status_rows
    ]

    return {
        "period_days": days,
        "total_orders": int(total_orders),
        "revenue_total": revenue_total,
        "by_day": by_day,
        "by_status": by_status,
    }


def get_visits_stats(db: Session, days: int) -> dict:
    cutoff = _cutoff_utc(days)
    day_col = func.date(models.PageView.created_at)

    total_views = (
        db.query(func.count(models.PageView.id))
        .filter(models.PageView.created_at >= cutoff)
        .filter(_page_views_scope())
        .scalar()
    ) or 0

    by_day_rows = (
        db.query(day_col, func.count(models.PageView.id))
        .filter(models.PageView.created_at >= cutoff)
        .filter(_page_views_scope())
        .group_by(day_col)
        .order_by(day_col)
        .all()
    )

    by_day = [
        {
            "date": row[0].isoformat() if hasattr(row[0], "isoformat") else str(row[0]),
            "views": int(row[1]),
        }
        for row in by_day_rows
    ]

    top_rows = (
        db.query(models.PageView.path, func.count(models.PageView.id))
        .filter(models.PageView.created_at >= cutoff)
        .filter(_page_views_scope())
        .group_by(models.PageView.path)
        .order_by(func.count(models.PageView.id).desc())
        .limit(10)
        .all()
    )
    top_paths = [{"path": p, "count": int(c)} for p, c in top_rows]

    return {
        "period_days": days,
        "total_views": int(total_views),
        "by_day": by_day,
        "top_paths": top_paths,
    }
