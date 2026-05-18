from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from contextlib import contextmanager
import os
from urllib.parse import quote_plus
import logging

logger = logging.getLogger(__name__)

# Supabase Session Pooler (IPv4 compatible for Vercel)
DB_USER = os.getenv("DB_USER", "postgres.xjfrvfxuzijvuszpwfhd")
DB_PASS = os.getenv("DB_PASS", "")  # Should be set in environment
DB_HOST = os.getenv("DB_HOST", "aws-1-eu-north-1.pooler.supabase.com")
DB_PORT = os.getenv("DB_PORT", "6543")
DB_NAME = os.getenv("DB_NAME", "postgres")

# Validate required environment variables
if not DB_PASS and not os.getenv("DATABASE_URL"):
    logger.warning("DB_PASS or DATABASE_URL environment variable is not set!")

# URL-encode the password to handle special characters like @
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql://{DB_USER}:{quote_plus(DB_PASS)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,  # Increased recycle time
    pool_size=5,  # Increased pool size for better concurrency
    max_overflow=10,  # Allow more overflow connections
    connect_args={"connect_timeout": 10},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for FastAPI routes to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """Context manager for database sessions outside of FastAPI routes."""
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
        logger.error(f"Database connection test failed: {e}")
        return {"status": "error", "error": str(e)}
