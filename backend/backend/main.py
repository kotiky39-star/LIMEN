"""
PORTAL API — точка входа FastAPI.
Запуск из папки backend/:  uvicorn main:app --reload --port 8001
Документация: http://localhost:8001/docs
"""
import os
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from achievements_data import GAMES, mock_unlocked
from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    create_steam_state,
    decode_steam_state,
    get_current_user,
    get_optional_user,
    hash_password,
    verify_password,
)
from database import get_db, init_db
from models import AchievementTips, LinkedPlatform, User
from schemas import (
    AchievementOut,
    AchievementsResponse,
    SearchItem,
    SearchResponse,
    SteamLink,
    TipCreate,
    TipOut,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserOut,
)

# OpenID (python3-openid) — опционально, чтобы сервер стартовал даже без пакета
try:
    from openid.consumer.consumer import Consumer, SUCCESS
    from openid.store.memstore import MemoryStore

    _OPENID_STORE = MemoryStore()
    _OPENID_AVAILABLE = True
except Exception:  # pragma: no cover
    _OPENID_STORE = None
    _OPENID_AVAILABLE = False
    SUCCESS = None

# Игры, у которых нет достижений в Steam (фоллбэк на PSN)
PSN_ONLY_GAMES = {"ac2"}

# Транслитерация кириллицы для нечёткого поиска
_TRANSLIT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
}


def _translit(text: str) -> str:
    return "".join(_TRANSLIT.get(ch.lower(), ch) for ch in text)


def fetch_steam_profile(steamid64: str) -> dict | None:
    """Получает ник и аватар через Steam Web API (нужен STEAM_API_KEY)."""
    api_key = os.getenv("STEAM_API_KEY")
    if not api_key:
        return None
    try:
        import requests

        resp = requests.get(
            "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/",
            params={"key": api_key, "steamids": steamid64},
            timeout=10,
        )
        resp.raise_for_status()
        players = resp.json().get("response", {}).get("players", [])
        if not players:
            return None
        p = players[0]
        return {
            "steamid": p.get("steamid"),
            "personaname": p.get("personaname"),
            "avatar": p.get("avatar"),
            "avatarmedium": p.get("avatarmedium"),
            "avatarfull": p.get("avatarfull"),
            "profileurl": p.get("profileurl"),
        }
    except Exception:
        return None


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="PORTAL API", version="1.0.0", lifespan=lifespan)

# CORS: по умолчанию разрешены все источники (авторизация идёт через заголовок Authorization, без cookies),
# поэтому index.html работает и с Live Server, и открытым как file://.
# Для продакшена: PORTAL_CORS_ORIGINS="https://site.ru,https://www.site.ru"
_origins = [o.strip() for o in os.getenv("PORTAL_CORS_ORIGINS", "*").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


def token_response(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id),
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserOut.model_validate(user),
    )


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.scalar(select(User.id).where(User.email == data.email)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Пользователь с таким email уже зарегистрирован")
    user = User(email=data.email, hashed_password=hash_password(data.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Пользователь с таким email уже зарегистрирован")
    db.refresh(user)
    return token_response(user)


@app.post("/api/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email))
    if user is None or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token_response(user)


@app.get("/api/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@app.post("/api/link-steam", response_model=UserOut)
def link_steam(data: SteamLink, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Заглушка: вместо Steam OpenID просто сохраняем ник. Повторный вызов обновляет ник."""
    link = user.platform("steam")
    if link:
        link.platform_username = data.steam_username
    else:
        user.platforms.append(LinkedPlatform(platform_name="steam", platform_username=data.steam_username))
    db.commit()
    db.refresh(user)
    return user


# ===================== STEAM OPENID =====================

@app.get("/api/auth/steam/login")
def steam_login(user: User = Depends(get_current_user), redirect_uri: str | None = Query(None)):
    """Формирует URL для редиректа на Steam OpenID."""
    if not _OPENID_AVAILABLE:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="python3-openid не установлен")

    base_url = os.getenv("PORTAL_BASE_URL", "http://localhost:8001").rstrip("/")
    state = create_steam_state(user.id, redirect_uri)
    return_to = f"{base_url}/api/auth/steam/callback?state={state}"
    realm = f"{base_url}/"

    consumer = Consumer({}, _OPENID_STORE)
    auth_req = consumer.begin("https://steamcommunity.com/openid")
    redirect_url = auth_req.redirectURL(realm, return_to)
    return {"redirect_url": redirect_url, "url": redirect_url, "auth_url": redirect_url, "state": state}


@app.get("/api/auth/steam/callback")
def steam_callback(request: Request, state: str | None = None, db: Session = Depends(get_db)):
    """Принимает параметры от Steam, проверяет их и сохраняет steamid64 в LinkedPlatform."""
    if not _OPENID_AVAILABLE:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="python3-openid не установлен")

    params = dict(request.query_params)
    state = state or params.get("state")
    user_id, redirect_uri = decode_steam_state(state) if state else (None, None)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="state отсутствует или недействителен")

    base_url = os.getenv("PORTAL_BASE_URL", "http://localhost:8001").rstrip("/")
    return_to = f"{base_url}/api/auth/steam/callback?state={state}"

    consumer = Consumer({}, _OPENID_STORE)
    result = consumer.complete(params, return_to)

    if result.status != SUCCESS:
        if redirect_uri:
            from fastapi.responses import RedirectResponse
            sep = "&" if "?" in redirect_uri else "?"
            return RedirectResponse(url=f"{redirect_uri}{sep}steam_error={getattr(result, 'message', result.status)}", status_code=302)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OpenID проверка не пройдена: {getattr(result, 'message', result.status)}",
        )

    claimed_id = getattr(result, "identity_url", "") or ""
    steamid64 = claimed_id.rstrip("/").split("/")[-1]
    if not steamid64.isdigit() or len(steamid64) < 15:
        if redirect_uri:
            from fastapi.responses import RedirectResponse
            sep = "&" if "?" in redirect_uri else "?"
            return RedirectResponse(url=f"{redirect_uri}{sep}steam_error=bad_steamid", status_code=302)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Не удалось извлечь steamid64")

    user = db.get(User, user_id)
    if user is None:
        if redirect_uri:
            from fastapi.responses import RedirectResponse
            sep = "&" if "?" in redirect_uri else "?"
            return RedirectResponse(url=f"{redirect_uri}{sep}steam_error=user_not_found", status_code=302)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Пользователь не найден")

    link = user.platform("steam")
    if link:
        link.platform_username = steamid64
    else:
        user.platforms.append(LinkedPlatform(platform_name="steam", platform_username=steamid64))
    db.commit()
    db.refresh(user)

    if redirect_uri:
        from fastapi.responses import RedirectResponse
        sep = "&" if "?" in redirect_uri else "?"
        return RedirectResponse(url=f"{redirect_uri}{sep}steam=ok", status_code=302)
    return {"steamid64": steamid64, "user": UserOut.model_validate(user)}


@app.get("/api/steam/profile")
def steam_profile(user: User = Depends(get_current_user)):
    """Аватар и ник из Steam Web API (если привязан Steam и задан STEAM_API_KEY)."""
    link = user.platform("steam")
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Steam не привязан")
    profile = fetch_steam_profile(link.platform_username)
    if profile is None:
        return {
            "steamid": link.platform_username,
            "personaname": None,
            "avatar": None,
            "note": "STEAM_API_KEY не задан или ошибка запроса к Steam Web API",
        }
    return profile


# ===================== ДОСТИЖЕНИЯ =====================

@app.get("/api/achievements/{game_id}", response_model=AchievementsResponse)
def achievements(game_id: str, user: User | None = Depends(get_optional_user), db: Session = Depends(get_db)):
    game = GAMES.get(game_id)
    if game is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Игра не найдена")
    steam = user.platform("steam") if user else None
    source = "PSN" if game_id in PSN_ONLY_GAMES else "Steam"
    items = [
        AchievementOut(
            **a,
            unlocked=bool(steam) and mock_unlocked(steam.platform_username, game_id, a["index"], a["rarity"]),
        )
        for a in game["achievements"]
    ]
    return AchievementsResponse(
        game_id=game_id,
        title=game["title"],
        steam_linked=bool(steam),
        unlocked_count=sum(a.unlocked for a in items),
        total=len(items),
        achievements=items,
        source=source,
    )


# ===================== НЕЧЁТКИЙ ПОИСК =====================

@app.get("/api/search", response_model=SearchResponse)
def search(q: str = Query(..., min_length=1)):
    try:
        from rapidfuzz import fuzz, process
    except Exception:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="rapidfuzz не установлен")

    query = q.strip()
    variants = {query.lower(), _translit(query).lower()}

    candidates = [(gid, g["title"]) for gid, g in GAMES.items()]
    titles = [c[1] for c in candidates]

    best: dict[str, float] = {}
    for v in variants:
        for match_str, score, idx in process.extract(v, titles, scorer=fuzz.WRatio, limit=10):
            gid = candidates[idx][0]
            if score > best.get(gid, 0):
                best[gid] = float(score)

    results = [
        SearchItem(id=gid, title=next(c[1] for c in candidates if c[0] == gid), score=round(sc, 2))
        for gid, sc in best.items()
        if sc >= 50
    ]
    results.sort(key=lambda x: x.score, reverse=True)
    return SearchResponse(q=query, results=results)


# ===================== СОВЕТЫ К ДОСТИЖЕНИЯМ =====================

@app.post("/api/tips", response_model=TipOut, status_code=status.HTTP_201_CREATED)
def create_tip(data: TipCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tip = AchievementTips(
        user_id=user.id,
        game_id=data.game_id,
        achievement_id=data.achievement_id,
        text=data.text,
    )
    db.add(tip)
    db.commit()
    db.refresh(tip)
    return tip


@app.get("/api/tips/{game_id}", response_model=list[TipOut])
def list_tips(game_id: str, db: Session = Depends(get_db)):
    rows = db.scalars(
        select(AchievementTips)
        .where(AchievementTips.game_id == game_id)
        .order_by(AchievementTips.created_at.desc())
    ).all()
    return rows

from fastapi.staticfiles import StaticFiles

# Путь к папке с index.html (поднимаемся на два уровня вверх из backend/backend)
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")