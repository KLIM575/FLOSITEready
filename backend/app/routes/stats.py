from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..services import stats_service

router = APIRouter(prefix="/api/stats", tags=["stats"])


def _clamp_days(days: int) -> int:
    if days < 1:
        return 1
    if days > 365:
        return 365
    return days


@router.post("/pageview", status_code=201)
def record_pageview(
    body: schemas.PageViewCreate,
    db: Session = Depends(get_db),
):
    stats_service.record_pageview(db, body.path.strip())
    return {"ok": True}


@router.get("/sales", response_model=schemas.SalesStatsResponse)
def get_sales(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
):
    d = _clamp_days(days)
    data = stats_service.get_sales_stats(db, d)
    return schemas.SalesStatsResponse(**data)


@router.get("/visits", response_model=schemas.VisitsStatsResponse)
def get_visits(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
):
    d = _clamp_days(days)
    data = stats_service.get_visits_stats(db, d)
    return schemas.VisitsStatsResponse(**data)
