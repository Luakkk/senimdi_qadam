from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # ai_db
    DATABASE_URL: str = "postgresql://ai_user:ai_pass@localhost:5436/ai_db"
    # core_db (для поиска организаций)
    CORE_DATABASE_URL: str = "postgresql://core_user:core_pass@localhost:5434/core_db"

    PORT: int = 8000

    # Azure OpenAI
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_DEPLOYMENT: str = "gpt-4o"
    AZURE_OPENAI_API_VERSION: str = "2025-01-01-preview"

    class Config:
        env_file = ".env"

settings = Settings()
