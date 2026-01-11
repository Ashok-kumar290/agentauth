"""
AgentAuth Configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = "postgresql+asyncpg://localhost:5432/agentauth"
    
    # Security
    secret_key: str = "dev-secret-key-change-in-production"
    
    # Token settings
    token_expiry_seconds: int = 3600  # 1 hour
    auth_code_expiry_seconds: int = 300  # 5 minutes
    
    # Application
    debug: bool = False
    environment: str = "development"
    
    # JWT settings
    jwt_algorithm: str = "HS256"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
