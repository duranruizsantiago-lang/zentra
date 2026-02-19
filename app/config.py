"""
Application configuration from environment variables.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://vendia:vendia_dev@postgres:5432/vendia"
    redis_url: str = "redis://redis:6379"

    @property
    def async_database_url(self) -> str:
        """Convert Railway's postgresql:// to asyncpg format."""
        url = self.database_url
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    # WhatsApp (Meta Cloud API)
    whatsapp_token: str = ""
    whatsapp_phone_id: str = ""
    whatsapp_verify_token: str = "vendia-webhook-verify-2024"

    # Shopify
    shopify_api_key: str = ""
    shopify_api_secret: str = ""

    # Claude AI
    anthropic_api_key: str = ""

    # App
    api_key: str = "dev-key-123"
    app_url: str = "http://localhost:8000"

    class Config:
        env_file = ".env"


settings = Settings()
