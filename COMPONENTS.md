# Документация компонентов

## Layout компоненты

### Header (`src/components/layout/Header.tsx`)
Главная шапка сайта с полным функционалом.

**Особенности:**
- Логотип с анимацией при наведении
- Навигационное меню для десктопа
- Поиск по товарам (скрыт на мобильных)
- Иконка корзины с счетчиком товаров
- Иконка профиля
- Мобильное бургер-меню
- Sticky позиционирование

**Используемые технологии:**
- React Router для навигации
- Tailwind CSS для стилизации
- SVG иконки

### Footer (`src/components/layout/Footer.tsx`)
Подвал сайта с расширенной информацией.

**Секции:**
- Информация о компании с логотипом
- Социальные сети (Instagram, Facebook, VK)
- Навигационные ссылки
- Информационные ссылки
- Контактная информация (телефон, email, адрес, время работы)
- Копирайт и юридические ссылки

### Layout (`src/components/layout/Layout.tsx`)
Общий layout для всех страниц.

**Структура:**
```tsx
<Layout>
  <Header />
  <main>{children}</main>
  <Footer />
</Layout>
```

## Компоненты главной страницы

### Hero (`src/components/home/Hero.tsx`)
Hero секция с главным призывом к действию.

**Содержимое:**
- Заголовок с акцентом
- Описание магазина
- Две CTA кнопки (Каталог, О нас)
- Изображение с fallback на Unsplash

### Features (`src/components/home/Features.tsx`)
Секция с преимуществами магазина.

**Особенности:**
- 4 карточки с иконками-эмодзи
- Анимация при наведении
- Адаптивная сетка

### FeaturedProducts (`src/components/home/FeaturedProducts.tsx`)
Секция с популярными товарами.

**Функционал:**
- Отображение 4 товаров
- Карточки с изображениями
- Цена и категория
- Кнопка "В корзину"
- Ссылка на полный каталог
- Hover эффекты

### CallToAction (`src/components/home/CallToAction.tsx`)
Финальный призыв к действию.

**Содержимое:**
- Заголовок
- Телефон для связи
- Кнопка перехода в каталог

## Страницы

### HomePage (`src/pages/HomePage.tsx`)
Главная страница, собирающая все компоненты home секции.

### AboutPage (`src/pages/AboutPage.tsx`)
Страница "О компании" с информацией и статистикой.

### ContactsPage (`src/pages/ContactsPage.tsx`)
Страница контактов с формой обратной связи.

### CatalogPage (`src/pages/CatalogPage.tsx`)
Страница каталога (заглушка для будущей реализации).

### CartPage (`src/pages/CartPage.tsx`)
Страница корзины (заглушка для будущей реализации).

### ProfilePage (`src/pages/ProfilePage.tsx`)
Страница профиля (заглушка для будущей реализации).

## Стилизация

### Tailwind конфигурация
Кастомные цвета определены в `tailwind.config.js`:

**Primary** (розовые оттенки):
- 50-900: от светло-розового до темно-розового
- Используется для кнопок, ссылок, акцентов

**Elegant** (бежевые оттенки):
- 50-900: от светло-бежевого до темно-коричневого
- Используется для фонов и дополнительных элементов

### Шрифты
- **Playfair Display** - serif для заголовков
- **Inter** - sans-serif для текста

Подключаются через Google Fonts в `src/index.css`.

## Адаптивность

Все компоненты адаптированы для:
- Мобильных устройств (< 768px)
- Планшетов (768px - 1024px)
- Десктопов (> 1024px)

Используются Tailwind breakpoints:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px

## Использование компонентов

### Пример использования Layout:

```tsx
import Layout from './components/layout/Layout';

function App() {
  return (
    <Layout>
      <YourPageContent />
    </Layout>
  );
}
```

### Пример использования компонентов главной страницы:

```tsx
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';

const HomePage = () => {
  return (
    <div>
      <Hero />
      <Features />
    </div>
  );
};
```

## Доступные маршруты

Все маршруты настроены в `src/App.tsx`:

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/catalog" element={<CatalogPage />} />
  <Route path="/product/:id" element={<ProductPage />} />
  <Route path="/cart" element={<CartPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/admin" element={<AdminPage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/contacts" element={<ContactsPage />} />
</Routes>
```

## Следующие шаги для разработки

1. **Интеграция с CartContext**
   - Подключить счетчик корзины в Header
   - Реализовать добавление товаров

2. **Реализация каталога**
   - Создать компонент ProductCard
   - Добавить фильтры и сортировку
   - Подключить реальные данные

3. **Формы и валидация**
   - Форма обратной связи
   - Форма оформления заказа
   - Валидация полей

4. **Аутентификация**
   - Форма входа/регистрации
   - Интеграция с AuthContext
   - Защищенные маршруты

5. **API интеграция**
   - Подключение к backend
   - Загрузка товаров
   - Обработка заказов
