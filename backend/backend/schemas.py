"""Pydantic-схемы запросов и ответов."""
from datetime import datetime, timezone
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field, field_validator


# SQLite не хранит часовой пояс — считаем значения UTC и отдаём с "+00:00"
UTCDatetime = Annotated[datetime, AfterValidator(lambda d: d if d.tzinfo else d.replace(tzinfo=timezone.utc))]


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class UserLogin(UserCreate):
    password: str = Field(min_length=1, max_length=128)


class PlatformOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    platform_name: str
    platform_username: str
    linked_at: UTCDatetime


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    created_at: UTCDatetime
    platforms: list[PlatformOut] = []


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class SteamLink(BaseModel):
    steam_username: str = Field(min_length=2, max_length=64)

    @field_validator("steam_username")
    @classmethod
    def strip_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Ник Steam слишком короткий")
        return v


class AchievementOut(BaseModel):
    index: int
    title: str
    description: str
    rarity: float
    icon: str
    guide: str
    tips: list[str]
    unlocked: bool = False


class AchievementsResponse(BaseModel):
    game_id: str
    title: str
    steam_linked: bool
    unlocked_count: int
    total: int
    achievements: list[AchievementOut]
    source: str = "Steam"  # "Steam" или "PSN"


class TipCreate(BaseModel):
    game_id: str = Field(min_length=1, max_length=64)
    achievement_id: int = Field(ge=0)
    text: str = Field(min_length=1, max_length=2000)


class TipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    game_id: str
    achievement_id: int
    text: str
    created_at: UTCDatetime


class SearchItem(BaseModel):
    id: str
    title: str
    score: float


class SearchResponse(BaseModel):
    q: str
    results: list[SearchItem]
