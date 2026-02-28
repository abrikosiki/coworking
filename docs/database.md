---
title: Схема базы данных
description: Полная схема таблиц Supabase — колонки, типы, связи, миграции.
tags: [database, supabase, schema]
status: active
related_files: [docs/architecture.md, sql/, src/lib/supabase.ts]
---

# Схема базы данных (Supabase)

## Обзор

Проект использует Supabase (PostgreSQL). Три таблицы:

| Таблица | Описание |
|---------|----------|
| `auth.users` | Системная таблица Supabase — аутентификация |
| `public.profiles` | Профили пользователей (admin / member) |
| `public.coworkings` | Коворкинг-пространства |

---

## auth.users (системная)

Управляется Supabase Auth. Приложение использует:

| Поле | Описание |
|------|----------|
| `id` (uuid) | PK, используется как FK в `profiles.id` |
| `email` (text) | Email для входа |
| `raw_user_meta_data` | JSON с `full_name` при регистрации |

---

## public.profiles

Основная таблица приложения. Создаётся при регистрации пользователя.

| Колонка | Тип | Default | Nullable | Описание |
|---------|-----|---------|----------|----------|
| `id` | uuid | — | NOT NULL | PK, FK → `auth.users.id` ON DELETE CASCADE |
| `name` | text | — | NOT NULL | Имя пользователя |
| `role` | text | `'member'` | NOT NULL | `'admin'` или `'member'` (CHECK constraint) |
| `specialization` | text | — | YES | Developer / Designer / Marketing / Other |
| `avatar_url` | text | — | YES | URL аватарки |
| `bio` | text | — | YES | О себе |
| `linkedin` | text | — | YES | Ссылка на LinkedIn |
| `telegram` | text | — | YES | Telegram-хендл |
| `skills` | text[] | `'{}'::text[]` | YES | Массив навыков |
| `checkin_at` | timestamptz | — | YES | Время чекина (NULL = не в коворкинге) |
| `created_at` | timestamptz | `now()` | NOT NULL | Дата создания профиля |
| `updated_at` | timestamptz | `now()` | NOT NULL | Дата обновления (триггер) |

**Операции в коде:**
- `INSERT` — при регистрации (`signup`, `register`): `id`, `full_name`, `role`, `specialization`
- `UPDATE` — редактирование профиля: `full_name`, `specialization`, `bio`, `linkedin`, `telegram`, `skills`
- `UPDATE` — чекин/чекаут: `checkin_at`
- `SELECT *` — профиль, лента резидентов, публичный профиль

**Realtime:** Подписка на канал `profiles-changes` (INSERT/UPDATE) на главной странице.

---

## public.coworkings

Коворкинг-пространства, создаются администраторами.

| Колонка | Тип | Default | Nullable | Описание |
|---------|-----|---------|----------|----------|
| `id` | uuid | `gen_random_uuid()` | NOT NULL | PK |
| `owner_id` | uuid | — | NOT NULL | FK → `profiles.id` ON DELETE CASCADE, владелец |
| `name` | text | — | NOT NULL | Название коворкинга |
| `city` | text | — | NOT NULL | Город |
| `address` | text | — | NOT NULL | Адрес |
| `created_at` | timestamptz | `now()` | NOT NULL | Дата создания |
| `updated_at` | timestamptz | `now()` | NOT NULL | Дата обновления |

**RLS-политики:**
- SELECT: все authenticated
- INSERT: `auth.uid() = owner_id`
- UPDATE: `auth.uid() = owner_id`

**Операции в коде:**
- `INSERT` — при регистрации админа: `name`, `city`, `address`, `owner_id`

---

## Связи между таблицами

```
auth.users
    │
    └── 1:1 ── profiles (profiles.id = auth.users.id)
                    │
                    └── 1:N ── coworkings (coworkings.owner_id = profiles.id)
```

---

## Миграции

Файлы миграций хранятся в `sql/`:

| Файл | Описание |
|------|----------|
| `001_add_profile_columns.sql` | Добавляет колонки bio, specialization, linkedin, telegram, skills, checkin_at, status, created_at |

**Как применить:** Supabase → SQL Editor → New query → вставить SQL → Run.

> Начальное создание таблиц `profiles` и `coworkings` было выполнено через Supabase Dashboard (SQL не сохранён).
