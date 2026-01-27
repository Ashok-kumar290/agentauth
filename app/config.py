"""
AgentAuth Configuration

All secrets MUST be provided via environment variables.
No default values for production-critical settings.
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
from typing import Optional, List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database (REQUIRED)
    database_url: str = "postgresql+asyncpg://localhost:5432/agentauth"
    
    # Security (REQUIRED in production)
    secret_key: str = ""  # No default - must be set
    
    # Token settings
    token_expiry_seconds: int = 3600  # 1 hour
    auth_code_expiry_seconds: int = 300  # 5 minutes
    
    # Application
    debug: bool = False
    environment: str = "development"
    log_level: str = "INFO"
    log_json: bool = False  # True for production
    
    # CORS - comma-separated list of allowed origins
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"
    
    # JWT settings
    jwt_algorithm: str = "HS256"
    
    # Stripe settings (use test keys in development)
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_price_pro: str = ""
    stripe_price_enterprise: str = ""
    
    # Admin panel settings (REQUIRED in production)
    admin_password: str = ""  # No default - must be set
    admin_jwt_secret: str = ""  # No default - must be set
    admin_token_expiry: int = 3600  # 1 hour
    
    # Redis settings
    redis_url: str = "redis://localhost:6379"
    redis_password: str = ""
    redis_db: int = 0
    redis_ssl: bool = False
    
    # Rate limiting
    rate_limit_requests_per_second: int = 100
    rate_limit_burst: int = 200
    
    # Caching
    cache_ttl_seconds: int = 300  # 5 minutes default
    cache_consent_ttl: int = 600  # 10 minutes for consents
    
    # Monitoring
    sentry_dsn: str = ""  # Optional - for error tracking
    
    @field_validator("secret_key", "admin_password", "admin_jwt_secret")
    @classmethod
    def validate_secrets_in_production(cls, v: str, info) -> str:
        """Ensure secrets are set in production."""
        env = os.getenv("ENVIRONMENT", "development")
        if env == "production" and not v:
            raise ValueError(
                f"{info.field_name} must be set in production environment"
            )
        # Provide dev defaults only in development
        if not v and env != "production":
            defaults = {
                "secret_key": "dev-secret-key-not-for-production",
                "admin_password": "agentauth2026",
                "admin_jwt_secret": "dev-admin-secret-not-for-production",
            }
            return defaults.get(info.field_name, "")
        return v
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
