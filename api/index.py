from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title="Poizon666 App API", redirect_slashes=False)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy table creation
_tables_created = False

def ensure_tables():
    global _tables_created
    if not _tables_created:
        try:
            from api.database import engine, Base
            from api import models
            Base.metadata.create_all(bind=engine)
            _tables_created = True
        except Exception as e:
            logger.error(f"Failed to create tables: {e}")

# Import and include routers
from api.routers import orders, settings

app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Poizon666 Backend is running!"}

@app.on_event("startup")
async def startup_event():
    ensure_tables()
