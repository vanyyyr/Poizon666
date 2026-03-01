from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

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
    """Auto-migrate database schema — add missing columns."""
    global _migrated
    if _migrated:
        return
    try:
        from api.database import engine
        from sqlalchemy import text
        with engine.connect() as conn:
            # Add commission_percent if missing (rename from commission)
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
            # Update old high commission values (1500 was a fixed fee, now it's %)
            conn.execute(text("UPDATE settings SET commission_percent = 10.0 WHERE commission_percent > 100"))
            conn.commit()
        _migrated = True
        logger.info("Database migration completed successfully")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        _migrated = True  # Don't retry on every request

# Run migrations on import (before first request)
run_migrations()

# Import and include routers
from api.routers import orders, settings, broadcast

app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(broadcast.router, prefix="/api/broadcast", tags=["broadcast"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Poizon666 Backend is running!"}
