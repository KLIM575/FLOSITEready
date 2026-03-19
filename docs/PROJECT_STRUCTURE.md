# Структура проекта цветочного магазина

## Архитектура

Проект построен на React + TypeScript + Vite с модульной архитектурой.

## Структура папок

```
PROJECT/
├── public/                      # Статические файлы
│   ├── images/
│   │   ├── products/           # Изображения товаров
│   │   └── icons/              # Иконки
│   └── vite.svg
│
├── src/
│   ├── components/             # React компоненты
│   │   ├── common/            # Общие переиспользуемые компоненты
│   │   │   ├── Button.tsx     # Кнопка
│   │   │   ├── Input.tsx      # Поле ввода
│   │   │   ├── Modal.tsx      # Модальное окно
│   │   │   └── Card.tsx       # Карточка
│   │   │
│   │   ├── layout/            # Компоненты макета
│   │   │   ├── Header.tsx     # Шапка сайта
│   │   │   ├── Footer.tsx     # Подвал
│   │   │   ├── Navigation.tsx # Навигация
│   │   │   └── Layout.tsx     # Общий layout
│   │   │
│   │   ├── catalog/           # Компоненты каталога
│   │   │   ├── ProductCard.tsx    # Карточка товара
│   │   │   ├── ProductList.tsx    # Список товаров
│   │   │   └── FilterBar.tsx      # Фильтры
│   │   │
│   │   ├── cart/              # Компоненты корзины
│   │   │   ├── CartItem.tsx       # Элемент корзины
│   │   │   └── CartSummary.tsx    # Итоги корзины
│   │   │
│   │   ├── checkout/          # Компоненты оформления заказа
│   │   │   ├── ShippingForm.tsx   # Форма доставки
│   │   │   ├── PaymentForm.tsx    # Форма оплаты
│   │   │   └── OrderSummary.tsx   # Итоги заказа
│   │   │
│   │   ├── profile/           # Компоненты профиля
│   │   │   ├── ProfileForm.tsx    # Форма профиля
│   │   │   └── OrderHistory.tsx   # История заказов
│   │   │
│   │   └── admin/             # Компоненты админки
│   │       ├── ProductManager.tsx # Управление товарами
│   │       ├── ProductForm.tsx    # Форма товара
│   │       └── OrderManager.tsx   # Управление заказами
│   │
│   ├── pages/                 # Страницы приложения
│   │   ├── CatalogPage.tsx    # Страница каталога
│   │   ├── ProductPage.tsx    # Страница товара
│   │   ├── CartPage.tsx       # Страница корзины
│   │   ├── CheckoutPage.tsx   # Страница оформления
│   │   ├── ProfilePage.tsx    # Личный кабинет
│   │   ├── AdminPage.tsx      # Админ панель
│   │   └── index.ts           # Экспорты страниц
│   │
│   ├── context/               # React Context для состояния
│   │   ├── CartContext.tsx    # Контекст корзины
│   │   └── AuthContext.tsx    # Контекст аутентификации
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useProducts.ts     # Хук для работы с товарами
│   │   └── useOrders.ts       # Хук для работы с заказами
│   │
│   ├── services/              # API сервисы
│   │   └── api.ts             # Централизованные API вызовы
│   │
│   ├── types/                 # TypeScript типы
│   │   └── index.ts           # Интерфейсы и типы
│   │
│   ├── utils/                 # Утилиты
│   │   ├── formatters.ts      # Форматирование (цены, даты)
│   │   └── validators.ts      # Валидация форм
│   │
│   ├── constants/             # Константы
│   │   └── index.ts           # Константы приложения
│   │
│   ├── styles/                # Глобальные стили
│   │   └── variables.css      # CSS переменные
│   │
│   ├── App.tsx                # Главный компонент
│   ├── main.tsx               # Точка входа
│   └── index.css              # Глобальные стили
│
├── .env.example               # Пример переменных окружения
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Ключевые особенности структуры

### 1. Модульность
- Компоненты разделены по функциональным областям
- Каждый модуль имеет свои компоненты и логику

### 2. Переиспользуемость
- Общие компоненты (Button, Input, Modal, Card) в `common/`
- Layout компоненты для единообразия интерфейса

### 3. Разделение ответственности
- **Components**: Только UI логика
- **Pages**: Композиция компонентов для страниц
- **Context**: Глобальное состояние (корзина, авторизация)
- **Services**: API взаимодействие
- **Hooks**: Переиспользуемая логика
- **Utils**: Вспомогательные функции

### 4. Типизация
- Централизованные TypeScript типы в `types/`
- Строгая типизация для Product, Order, User, CartItem

### 5. Масштабируемость
- Легко добавлять новые страницы
- Простое расширение функционала
- Четкая структура для команды

## Основные сущности

### Product (Товар)
- id, name, description, price, image, category, inStock

### CartItem (Элемент корзины)
- product, quantity

### User (Пользователь)
- id, email, name, phone, address, role

### Order (Заказ)
- id, userId, items, totalAmount, status, shippingAddress, dates

## Следующие шаги для разработки

1. Настроить роутинг (React Router)
2. Реализовать компоненты каталога
3. Добавить функционал корзины
4. Создать формы оформления заказа
5. Реализовать личный кабинет
6. Разработать админ панель
7. Подключить backend API
8. Добавить стилизацию (CSS Modules / Styled Components / Tailwind)
9. Реализовать аутентификацию
10. Добавить валидацию форм
