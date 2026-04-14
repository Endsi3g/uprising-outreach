from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = "postgresql+asyncpg://outreach:outreach@localhost/outreach"
    database_url_test: str = "postgresql+asyncpg://outreach:outreach@localhost/outreach_test"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Security
    secret_key: str = "change-me"
    encryption_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30

    # AI
    anthropic_api_key: str = ""

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/senders/oauth/gmail/callback"

    # Microsoft OAuth
    microsoft_client_id: str = ""
    microsoft_client_secret: str = ""
    microsoft_tenant_id: str = "common"
    microsoft_redirect_uri: str = "http://localhost:8000/api/v1/senders/oauth/outlook/callback"

    # Ollama (local AI)
    ollama_base_url: str = "http://localhost:11434"

    # App
    environment: str = "development"
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:3000"

    # Email limits
    default_daily_send_limit: int = 100

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    @property
    def is_development(self) -> bool:
        return self.environment == "development"


settings = Settings()
