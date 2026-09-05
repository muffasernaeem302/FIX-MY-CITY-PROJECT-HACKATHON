"""Application configuration using Pydantic Settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All environment variables consumed by the backend."""

    # App
    APP_ENV: str = "development"
    APP_PORT: int = 8000
    APP_CORS_ORIGINS: str = "http://localhost:5173"

    # Database
    DATABASE_URL: str = (
        "postgresql+psycopg2://fixmycity:fixmycity@localhost:5432/fixmycity"
    )

    # Auth
    AUTH_SECRET: str = "change-me-32-bytes-min"
    AUTH_ACCESS_TTL_MIN: int = 60

    # Storage
    STORAGE_DRIVER: str = "local"
    STORAGE_LOCAL_DIR: str = "./var/uploads"
    STORAGE_PUBLIC_BASE: str = "http://localhost:8000/static"

    # AI
    AI_PROVIDER: str = "dev_fallback"
    AI_API_KEY: str = ""
    AI_MODEL: str = "gpt-4o-mini"

    # Email
    EMAIL_PROVIDER: str = "console"
    EMAIL_FROM: str = "FixMyCity <noreply@fixmycity.local>"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TLS: bool = True

    # Rate limiting
    RATE_LIMIT_PER_MIN: int = 60

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()