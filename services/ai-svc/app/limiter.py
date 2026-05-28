"""
limiter.py — SlowAPI rate limiter (singleton)

Создаём один экземпляр Limiter и импортируем его в main.py и все роутеры.
По умолчанию лимит считается по IP-адресу запроса.

Redis backend: счётчики хранятся в Redis, а не in-memory.
Это критично при 2+ инстансах ai-svc:
  - in-memory: каждый инстанс считает отдельно → пользователь делает N×limit RPS
  - Redis: единый счётчик на кластер → лимит работает корректно
"""

import os
from slowapi import Limiter
from slowapi.util import get_remote_address

_redis_host     = os.getenv("REDIS_HOST", "redis")
_redis_port     = os.getenv("REDIS_PORT", "6379")
_redis_password = os.getenv("REDIS_PASSWORD", "")

# Если пароль задан — redis://:password@host:port, иначе — без пароля
if _redis_password:
    _redis_uri = f"redis://:{_redis_password}@{_redis_host}:{_redis_port}"
else:
    _redis_uri = f"redis://{_redis_host}:{_redis_port}"

# storage_uri=redis://... — slowapi использует библиотеку `limits` с Redis бэкендом
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=_redis_uri,
)
