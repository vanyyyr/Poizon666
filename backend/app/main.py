from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import orders, settings

# Create database tables (For production use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Poizon666 Mini App API")

# Configure CORS for Telegram Web Apps and Frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend deployment URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
