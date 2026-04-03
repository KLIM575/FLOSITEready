"""
Демо-данные для вкладки «Статистика»: просмотры страниц и заказы за ~90 дней.
Идемпотентно: повторный запуск пропускается по маркеру в page_views.
Запуск: из каталога backend — python -m app.seed_demo_stats
"""

from __future__ import annotations

import random
import uuid
from datetime import datetime, timedelta

from .database import SessionLocal, init_db
from .models import (
    Order,
    OrderItem,
    PageView,
    Product,
    ProductSizeEnum,
    ShippingAddress,
    User,
)

DEMO_MARKER_PATH = "__demo_marker__"
DEMO_ORDER_PREFIX = "demo-stat-"


def _utc_day_start(days_ago: int) -> datetime:
    now = datetime.utcnow()
    d = (now - timedelta(days=days_ago)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    return d


def _random_ts_on_day(day_start: datetime) -> datetime:
    offset_sec = random.randint(0, 24 * 3600 - 1)
    return day_start + timedelta(seconds=offset_sec)


def _item_price(product: Product, size: ProductSizeEnum | None) -> float:
    if size and product.sizes:
        for s in product.sizes:
            if s.size == size:
                return float(s.price)
    return float(product.price)


def seed_demo_statistics() -> None:
    init_db()
    db = SessionLocal()
    try:
        if (
            db.query(PageView)
            .filter(PageView.path == DEMO_MARKER_PATH)
            .first()
        ):
            print("Демо-статистика уже в базе, пропуск.")
            return

        products = db.query(Product).all()
        if not products:
            print("Нет товаров — сначала выполните основной seed (python -m app.seed).")
            return

        test_user = db.query(User).filter(User.email == "user@test.com").first()
        user_id = test_user.id if test_user else None

        random.seed(42)

        paths_pop = [
            "/",
            "/catalog",
            "/catalog?category=Розы",
            "/catalog?category=Композиции",
            "/product/1",
            "/product/2",
            "/product/3",
            "/product/4",
            "/cart",
            "/checkout",
            "/about",
            "/contacts",
        ]
        paths_w = [30, 22, 5, 4, 12, 9, 7, 6, 7, 4, 3, 2]

        batch_views: list[PageView] = []
        for day_idx in range(90):
            day_start = _utc_day_start(89 - day_idx)
            n_views = random.randint(8, 24)
            for _ in range(n_views):
                path = random.choices(paths_pop, weights=paths_w, k=1)[0]
                batch_views.append(
                    PageView(
                        id=str(uuid.uuid4()),
                        path=path[:500],
                        created_at=_random_ts_on_day(day_start),
                    )
                )

        db.add(
            PageView(
                id="00000000-0000-4000-8000-000000000001",
                path=DEMO_MARKER_PATH,
                created_at=datetime.utcnow(),
            )
        )
        db.add_all(batch_views)

        status_choices = (
            ["delivered"] * 38
            + ["shipped"] * 9
            + ["processing"] * 5
            + ["pending"] * 4
            + ["cancelled"] * 4
        )
        random.shuffle(status_choices)

        for i, status in enumerate(status_choices):
            day_start = _utc_day_start(random.randint(0, 89))
            created = _random_ts_on_day(day_start)
            order_id = f"{DEMO_ORDER_PREFIX}{uuid.uuid4()}"

            n_lines = random.choice([1, 1, 1, 2])
            lines: list[tuple[Product, ProductSizeEnum | None, int]] = []
            total = 0.0
            for _ in range(n_lines):
                p = random.choice(products)
                size: ProductSizeEnum | None = None
                if p.sizes:
                    size = random.choice(
                        [s.size for s in p.sizes]
                    )
                qty = random.choice([1, 1, 2])
                price = _item_price(p, size)
                total += price * qty
                lines.append((p, size, qty))

            order = Order(
                id=order_id,
                user_id=user_id,
                total_amount=round(total, 2),
                delivery_zone_id=None,
                delivery_fee=0.0,
                status=status,
                created_at=created,
                updated_at=created,
            )
            db.add(order)
            db.flush()

            for p, size, qty in lines:
                db.add(
                    OrderItem(
                        order_id=order_id,
                        product_id=p.id,
                        quantity=qty,
                        size=size,
                        price=_item_price(p, size),
                    )
                )

            db.add(
                ShippingAddress(
                    order_id=order_id,
                    name="Демо Клиент",
                    phone="+7 900 000-00-00",
                    email="demo.client@example.com",
                    city="Москва",
                    postal_code="101000",
                    address="ул. Демонстрационная, д. 1",
                    comment=None,
                    delivery_zone_name=None,
                )
            )

        db.commit()
        print(
            f"Демо-статистика добавлена: ~{len(batch_views)} просмотров, "
            f"{len(status_choices)} заказов за 90 дней."
        )
    except Exception as e:
        print(f"Ошибка демо-статистики: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_statistics()
