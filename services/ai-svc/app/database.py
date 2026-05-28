import time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy.exc import OperationalError, IntegrityError
from .config import settings

engine = create_engine(settings.DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db(retries: int = 10, delay: float = 2.0):
    """
    Инициализация БД: включаем pgvector и создаём таблицы.
    Повторяет попытки если PostgreSQL ещё не готов (Docker healthcheck race).
    IntegrityError игнорируется — это race condition при параллельном старте
    нескольких uvicorn workers, которые одновременно пытаются создать extension.
    """
    for attempt in range(1, retries + 1):
        try:
            with engine.connect() as conn:
                try:
                    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                    conn.commit()
                except IntegrityError:
                    # Race condition: другой worker уже создал extension — это нормально
                    conn.rollback()
            Base.metadata.create_all(bind=engine)
            print("✅ ai_db инициализирована")
            return
        except OperationalError as exc:
            if attempt == retries:
                raise RuntimeError(f"❌ Не удалось подключиться к ai_db после {retries} попыток") from exc
            print(f"⏳ ai_db не готова (попытка {attempt}/{retries}), ожидание {delay}с...")
            time.sleep(delay)
