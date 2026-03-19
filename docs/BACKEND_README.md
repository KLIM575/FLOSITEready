# Backend для интернет-магазина цветов

REST API на Python + FastAPI с SQLite базой данных.

## Установка

```bash
# Создать виртуальное окружение
python -m venv venv

# Активировать виртуальное окружение
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Установить зависимости
pip install -r requirements.txt
```

## Запуск

```bash
# Запуск dev сервера
uvicorn app.main:app --reload --port 8000

# Сервер будет доступен на http://localhost:8000
# API документация: http://localhost:8000/docs
```

## API Endpoints

### Товары
- `GET /api/products` - список товаров
- `GET /api/products/{id}` - детали товара
- `POST /api/products` - создать товар (admin)
- `PUT /api/products/{id}` - обновить товар (admin)
- `DELETE /api/products/{id}` - удалить товар (admin)
- `POST /api/products/{id}/images` - загрузить изображения

### Заказы
- `POST /api/orders` - создать заказ
- `GET /api/orders` - все заказы (admin)
- `GET /api/orders/user/{userId}` - заказы пользователя
- `PATCH /api/orders/{id}/status` - обновить статус (admin)

### Аутентификация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход

### Поиск
- `GET /api/search?q={query}` - поиск товаров

## База данных

Используется SQLite с автоматическим созданием таблиц при первом запуске.

Для заполнения начальными данными:
```bash
python -m app.seed
```
