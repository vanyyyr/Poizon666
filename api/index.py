from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import traceback

logger = logging.getLogger(__name__)

app = FastAPI(title="Poizon666 App API", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_migrated = False

def run_migrations():
    global _migrated
    if _migrated:
        return
    try:
        from api.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
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
            conn.execute(text("UPDATE settings SET commission_percent = 10.0 WHERE commission_percent > 100"))
            conn.commit()
        _migrated = True
        logger.info("Database migration completed successfully")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        _migrated = True

# Try migration but don't crash if it fails
try:
    run_migrations()
except Exception:
    pass

# Import and include routers
from api.routers import orders, settings, broadcast

app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(broadcast.router, prefix="/api/broadcast", tags=["broadcast"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Poizon666 Backend is running!"}

@app.get("/api/db-test")
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
