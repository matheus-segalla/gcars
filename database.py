import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gcars.db")

# Compatibilidade PostgreSQL Supabase
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if "sqlite" in DATABASE_URL:
    print("⚠️ ATENÇÃO: Conectando ao SQLite LOCAL (gcars.db)")
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    print("🚀 CONECTANDO AO SUPABASE (PostgreSQL Nuvem)...")
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()