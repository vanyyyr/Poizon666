from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.database import engine, Base
from api.routers import orders, settings

# Create tables on first run
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Poizon666 App API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under /api prefix
# Vercel rewrites /api/* -> /api/index.py
# FastAPI then handles /api/orders, /api/settings, etc.
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Poizon666 Backend is running!"}
