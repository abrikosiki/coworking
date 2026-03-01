# CI/CD Pipeline

Пайплайн настроен в `.github/workflows/ci.yml`. При каждом пуше в `main` запускаются два этапа.

## 1. Build (автоматически)

Запускается на каждый `git push` в ветку `main`:
- Устанавливает зависимости (`npm ci`)
- Проверяет код линтером (`npm run lint`)
- Собирает приложение (`npm run build`)

Если этот этап упал — значит в коде есть ошибки, деплой не произойдёт.

## 2. Deploy (по кнопке)

Запускается **только после успешного Build** и **только после ручного подтверждения** (если настроен environment `production` с required reviewers).

Что делает:
- Подключается к серверу по SSH (167.71.216.32)
- Выполняет: `git pull` -> `npm ci` -> `npm run build` -> `systemctl restart coworking`

## Как посмотреть статус

1. Открыть https://github.com/abrikosiki/coworking/actions
2. Увидишь список запусков пайплайна
3. Зелёная галочка = всё ОК, красный крестик = ошибка (нажми чтобы увидеть логи)

## GitHub Secrets (уже настроены)

| Secret | Описание |
|--------|----------|
| `SSH_PRIVATE_KEY` | SSH ключ для доступа к серверу |
| `SSH_HOST` | IP адрес сервера (167.71.216.32) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Публичный ключ Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Сервисный ключ Supabase |

---

## Настройка деплоя по кнопке (Environment Protection)

> Эту настройку может выполнить только **владелец репозитория** (аккаунт `abrikosiki`).
> Нужно сделать один раз, потом всё будет работать автоматически.

### Шаг 1. Открой настройки репозитория

1. Открой в браузере: https://github.com/abrikosiki/coworking
2. Нажми вкладку **Settings** (шестерёнка, в верхнем меню репозитория)

### Шаг 2. Создай environment

1. В левом боковом меню найди раздел **Environments** (в блоке "Code and automation")
2. Нажми кнопку **New environment**
3. В поле Name введи: `production` (именно так, маленькими буквами)
4. Нажми **Configure environment**

### Шаг 3. Включи обязательное подтверждение

1. На странице настройки environment поставь галочку **Required reviewers**
2. В поле поиска начни вводить свой GitHub логин (например `abrikosiki` или `petrovMA`)
3. Выбери нужного пользователя из выпадающего списка — он будет подтверждать деплой
4. Можно добавить нескольких reviewers
5. Нажми **Save protection rules**

### Готово!

Теперь при каждом пуше в main:
1. **Build** запустится автоматически (lint + сборка)
2. Если build прошёл, **Deploy** покажет статус "Waiting" с кнопкой
3. Reviewer получит уведомление на email
4. Reviewer нажимает **Review deployments** -> выбирает `production` -> **Approve and deploy**
5. Деплой начнётся автоматически

## Как подтвердить деплой (каждый раз)

1. Открой https://github.com/abrikosiki/coworking/actions
2. Нажми на последний запуск пайплайна (CI/CD)
3. Увидишь job `deploy` со статусом "Waiting"
4. Нажми **Review deployments**
5. Поставь галочку на `production`
6. Нажми **Approve and deploy**
7. Подожди пока деплой завершится (обычно ~1 минута)
8. Проверь сайт: https://coworking-facely.duckdns.org

## Если что-то пошло не так

- **Build упал** — посмотри логи ошибок в GitHub Actions, исправь код и сделай новый push
- **Deploy упал** — проверь что сервер доступен, SSH ключ валиден
- **Сайт не открывается после деплоя** — зайди на сервер по SSH и проверь `systemctl status coworking`
