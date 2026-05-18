"""Configuration settings for the application."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    db_user: str = "postgres.xjfrvfxuzijvuszpwfhd"
    db_pass: str = ""
    db_host: str = "aws-1-eu-north-1.pooler.supabase.com"
    db_port: str = "6543"
    db_name: str = "postgres"
    
    # Telegram
    telegram_bot_token: str = ""
    manager_chat_id: str = "709766413"
    
    # Supabase Storage
    supabase_url: str = "https://xjfrvfxuzijvuszpwfhd.supabase.co"
    supabase_key: str = ""
    
    # CORS
    allowed_origins: str = "*"
    
    # App
    debug: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
