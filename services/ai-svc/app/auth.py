"""
auth.py — JWT зависимость для FastAPI

Читает Bearer токен из Authorization заголовка,
декодирует его с тем же JWT_SECRET что используется в core-svc,
возвращает user_id (sub) из payload.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

bearer_scheme = HTTPBearer(auto_error=False)

JWT_SECRET    = os.getenv("JWT_SECRET", "senimdi-qadam-super-secret-jwt-key-2026")
JWT_ALGORITHM = "HS256"


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """
    Зависимость FastAPI — извлекает userId из JWT токена.
    Используй как: user_id: str = Depends(get_current_user_id)
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется авторизация (Bearer токен)",
        )

    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Невалидный токен: отсутствует sub",
            )
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Токен истёк — войди заново",
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Невалидный токен: {str(e)}",
        )


def get_optional_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str | None:
    """
    Опциональная зависимость — возвращает userId если токен есть,
    иначе None (для анонимных запросов).
    """
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except jwt.InvalidTokenError:
        return None
