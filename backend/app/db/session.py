from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.db.pool import build_engine


engine = build_engine(
    settings.DATABASE_URL,
    service="vb-pradhana-acharya",
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()