"""
Общая настройка pytest для ai-svc.

Модули app.config / app.chat / app.embeddings / app.auth читают переменные
окружения и создают клиента AzureOpenAI прямо на импорте. Поэтому переменные
нужно выставить ДО того, как тесты импортируют эти модули — делаем это здесь,
на уровне conftest (загружается раньше тестов).
"""
import os

os.environ.setdefault("JWT_SECRET", "test-secret-key")
os.environ.setdefault("AZURE_OPENAI_ENDPOINT", "https://test.openai.azure.com")
os.environ.setdefault("AZURE_OPENAI_API_KEY", "test-key")
os.environ.setdefault("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")
os.environ.setdefault("CORE_SVC_URL", "http://core-svc:3001")
