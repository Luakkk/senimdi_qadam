from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ai_db — в Docker контейнере хост = имя сервиса из docker-compose, порт = внутренний (5432)
    DATABASE_URL: str = "postgresql://ai_user:ai_pass@ai_db:5432/ai_db"

    # URL core-svc API — в Docker используем имя сервиса, не localhost
    CORE_SVC_URL: str = "http://core-svc:3001"

    PORT: int = 8000

    # JWT (same secret as core-svc — used to verify incoming tokens)
    JWT_SECRET: str = ""

    # Azure OpenAI
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_DEPLOYMENT: str = "gpt-4o"
    AZURE_OPENAI_API_VERSION: str = "2025-01-01-preview"
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT: str = "text-embedding-3-small"

    class Config:
        env_file = ".env"

settings = Settings()
