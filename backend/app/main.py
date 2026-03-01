from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import orders, settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Poizon666 App API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for Vercel deployment preview/production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders.router, prefix="/api")
app.include_router(settings.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend is running fine!"}
