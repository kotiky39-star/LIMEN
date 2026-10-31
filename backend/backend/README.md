# PORTAL — backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- API: http://localhost:8000/api — документация Swagger: http://localhost:8000/docs
- БД `users.db` и ключ подписи `.secret_key` создаются автоматически при первом запуске.
- Фронтенд (`index.html`) обращается к `http://localhost:8000/api`. Другой адрес — задать до основного скрипта: `<script>window.PORTAL_API = 'https://api.site.ru/api'</script>`.
- Если сервер не запущен, фронтенд работает в демо-режиме (вход имитируется в браузере).

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/register` | `{email, password}` → `{access_token, user}`; 409 если email занят |
| POST | `/api/login` | `{email, password}` → `{access_token, user}`; 401 при ошибке |
| GET | `/api/me` | текущий пользователь (заголовок `Authorization: Bearer <token>`) |
| POST | `/api/link-steam` | `{steam_username}` — заглушка привязки Steam |
| GET | `/api/achievements/{game_id}` | достижения игры; с токеном и привязанным Steam — поле `unlocked` |

Переменные окружения: `PORTAL_SECRET_KEY`, `PORTAL_TOKEN_MINUTES` (по умолчанию 10080), `PORTAL_CORS_ORIGINS` (по умолчанию `*`).
