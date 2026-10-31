"""Хэширование паролей (passlib) и JWT-токены (PyJWT)."""
import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import BASE_DIR, get_db
from models import User

# pbkdf2_sha256 встроен в passlib и не зависит от версии пакета bcrypt
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("PORTAL_TOKEN_MINUTES", "10080"))  # 7 дней
STEAM_STATE_EXPIRE_MINUTES = int(os.getenv("PORTAL_STEAM_STATE_MINUTES", "10"))


def _load_secret_key() -> str:
    """PORTAL_SECRET_KEY из окружения, иначе ключ из backend/.secret_key (создаётся при первом запуске)."""
    env = os.getenv("PORTAL_SECRET_KEY")
    if env:
        return env
    path: Path = BASE_DIR / ".secret_key"
    if path.exists():
        return path.read_text(encoding="utf-8").strip()
    key = secrets.token_urlsafe(48)
    path.write_text(key, encoding="utf-8")
    try:
        path.chmod(0o600)
    except OSError:
        pass
    return key


SECRET_KEY = _load_secret_key()

bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(password, hashed)
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: int, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    now = datetime.now(timezone.utc)
    payload = {"sub": str(user_id), "iat": now, "exp": now + timedelta(minutes=expires_minutes)}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный или просроченный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )


def create_steam_state(user_id: int, redirect_uri: str | None = None) -> str:
    """Короткоживущий JWT для привязки Steam-аккаунта (передаётся в return_to)."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "purpose": "steam_link",
        "redirect_uri": redirect_uri,
        "iat": now,
        "exp": now + timedelta(minutes=STEAM_STATE_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_steam_state(token: str) -> tuple[int | None, str | None]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "steam_link":
            return (None, None)
        return (int(payload["sub"]), payload.get("redirect_uri"))
    except (jwt.PyJWTError, KeyError, ValueError):
        return (None, None)


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется авторизация",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.get(User, decode_access_token(creds.credentials))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Пользователь не найден")
    return user


def get_optional_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    """Для публичных эндпоинтов: пользователь, если передан валидный токен, иначе None."""
    if creds is None:
        return None
    try:
        return db.get(User, decode_access_token(creds.credentials))
    except HTTPException:
        return None
