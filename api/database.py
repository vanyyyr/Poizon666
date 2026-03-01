from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from urllib.parse import quote_plus

# Supabase Session Pooler (IPv4 compatible for Vercel)
DB_USER = os.getenv("DB_USER", "postgres.xjfrvfxuzijvuszpwfhd")
DB_PASS = os.getenv("DB_PASS", "06112004RatII@")
DB_HOST = os.getenv("DB_HOST", "aws-1-eu-north-1.pooler.supabase.com")
DB_PORT = os.getenv("DB_PORT", "6543")
DB_NAME = os.getenv("DB_NAME", "postgres")

# URL-encode the password to handle special characters like @
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql://{DB_USER}:{quote_plus(DB_PASS)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=60,
    pool_size=1,
    max_overflow=2,
    connect_args={"connect_timeout": 10},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    """Test database connection and return result."""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return {"status": "connected", "result": str(result.scalar())}
    except Exception as e:
        return {"status": "error", "error": str(e), "url_preview": DATABASE_URL[:50] + "..."}
