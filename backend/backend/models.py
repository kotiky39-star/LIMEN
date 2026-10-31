"""Модели БД: User, LinkedPlatform, AchievementTips."""
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    platforms: Mapped[list["LinkedPlatform"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    tips: Mapped[list["AchievementTips"]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )

    def platform(self, name: str) -> "LinkedPlatform | None":
        return next((p for p in self.platforms if p.platform_name == name), None)


class LinkedPlatform(Base):
    __tablename__ = "linked_platforms"
    __table_args__ = (UniqueConstraint("user_id", "platform_name", name="uq_user_platform"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    platform_name: Mapped[str] = mapped_column(String(32), nullable=False)
    # Для Steam хранится steamid64 (17 цифр). Имя/аватар тянутся через Steam Web API.
    platform_username: Mapped[str] = mapped_column(String(64), nullable=False)
    linked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    user: Mapped[User] = relationship(back_populates="platforms")


class AchievementTips(Base):
    __tablename__ = "achievement_tips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    game_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    achievement_id: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(String(2000), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    user: Mapped[User] = relationship(back_populates="tips")
