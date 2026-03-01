from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Use Supabase URL from environment, or default to the provided one (in production, set this in Vercel Env Vars!)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:06112004RatII@@db.xjfrvfxuzijvuszpwfhd.supabase.co:5432/postgres")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
