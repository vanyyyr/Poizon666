from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import traceback
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    logger.info("Starting Poizon666 API...")
    try:
        run_migrations()
        logger.info("Database migrations completed successfully")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Poizon666 API...")
    from api.database import engine
    engine.dispose()

app = FastAPI(
    title="Poizon666 App API",
    description="API for Poizon666 Telegram Web App - Order management system",
    version="1.0.0",
    redirect_slashes=False,
    lifespan=lifespan
)

# Configure CORS with specific origins in production
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

_migrated = False

def run_migrations():
    """Run database schema migrations."""
    global _migrated
    if _migrated:
        return
    try:
        from api.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            # Check and rename column if needed
            conn.execute(text("""
                DO $$
                BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='commission')
                       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='commission_percent')
                    THEN
                        ALTER TABLE settings RENAME COLUMN commission TO commission_percent;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='commission_percent') THEN
                        ALTER TABLE settings ADD COLUMN commission_percent FLOAT DEFAULT 10.0;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='use_cbr_rate') THEN
                        ALTER TABLE settings ADD COLUMN use_cbr_rate BOOLEAN DEFAULT FALSE;
                    END IF;
                END $$;
            """))
            # Fix invalid commission values
            conn.execute(text("UPDATE settings SET commission_percent = 10.0 WHERE commission_percent > 100"))
            conn.commit()
        _migrated = True
        logger.info("Database migration completed successfully")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        _migrated = True
        raise  # Re-raise to fail fast on startup

# Try migration but don't crash if it fails
try:
    run_migrations()
except Exception:
    pass

# Import and include routers
from api.routers import orders, settings, broadcast, upload

app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(broadcast.router, prefix="/api/broadcast", tags=["Broadcast"])
app.include_router(upload.router, prefix="/api/upload", tags=["Upload"])


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "Poizon666 Backend is running!"}


@app.get("/api/db-test", tags=["Health"])
def db_test():
    """Diagnostic endpoint to test database connectivity."""
    from api.database import test_connection, DATABASE_URL
    result = test_connection()
    # Show a safe preview of the URL (hide password)
    url_parts = DATABASE_URL.split("@")
    safe_url = "***@" + url_parts[-1] if len(url_parts) > 1 else "***"
    result["connection_string"] = safe_url
    
    # Also try to query settings table
    if result["status"] == "connected":
        try:
            from api.database import engine
            from sqlalchemy import text
            with engine.connect() as conn:
                # Check what columns exist in settings
                cols = conn.execute(text(
                    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'settings' ORDER BY ordinal_position"
                ))
                result["settings_columns"] = [{"name": r[0], "type": r[1]} for r in cols]
                
                # Try to read settings
                row = conn.execute(text("SELECT * FROM settings LIMIT 1"))
                columns = row.keys()
                first = row.first()
                if first:
                    result["settings_data"] = dict(zip(columns, first))
                else:
                    result["settings_data"] = "no rows"
        except Exception as e:
            result["settings_error"] = str(e)
    
    return result


@app.get("/api/stats", tags=["Stats"])
def get_stats():
    """Get dynamic stats: channel subscribers + unique users."""
    import urllib.request
    import json
    from api.notifier import BOT_TOKEN

    stats = {"subscribers": 0, "unique_users": 0}

    # Fetch channel subscriber count from Telegram API
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/getChatMemberCount?chat_id=@poizon666_channel"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
            if data.get("ok"):
                stats["subscribers"] = data["result"]
    except Exception as e:
        logger.warning(f"Failed to fetch Telegram stats: {e}")

    # Count unique users from database
    try:
        from api.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            row = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
            stats["unique_users"] = row or 0
    except Exception as e:
        logger.warning(f"Failed to fetch user stats: {e}")

    return stats
