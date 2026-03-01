# CoWork

Приложение для коворкинга на Next.js + Supabase. Деплоится на DigitalOcean.

## Быстрый старт

```bash
npm install
npm run dev
```

Открыть http://localhost:3000

## Стек

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** с CSS-переменными для тем
- **Supabase** — Auth, PostgreSQL, Realtime
- **Font Awesome 6** + **Inter**

## Структура проекта

```
src/app/
├── page.tsx             # Главная (кто сейчас здесь)
├── login/page.tsx       # Авторизация
├── signup/page.tsx      # Регистрация
├── register/page.tsx    # Регистрация админа
├── profile/page.tsx     # Редактирование профиля
├── users/[id]/page.tsx  # Публичный профиль
├── dashboard/page.tsx   # Админ-панель
├── checkin/page.tsx     # Чекин
├── qr/page.tsx          # QR-код
├── globals.css          # Стили + темы
└── layout.tsx           # Корневой layout
```

## CI/CD

Каждый push в `main` автоматически запускает lint + build. Deploy — по кнопке (после настройки environment).

Статус пайплайна: https://github.com/abrikosiki/coworking/actions

## Документация

| Документ | Описание |
|----------|----------|
| [CI/CD Pipeline](docs/ci-cd.md) | Пайплайн сборки и деплоя, настройка деплоя по кнопке |
| [Цветовые темы](docs/themes.md) | 6 тем, CSS-переменные, как добавить новую тему |
| [Архитектура](docs/architecture.md) | Общая архитектура приложения |
| [База данных](docs/database.md) | Схема БД, таблицы, миграции |
| [Карта проекта](docs/map.md) | Навигация по файлам проекта |
