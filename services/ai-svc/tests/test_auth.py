"""Тесты auth.py — декодирование JWT (тот же секрет что в core-svc)."""
import os
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

import app.auth as auth

SECRET = os.environ["JWT_SECRET"]


def _token(payload: dict, secret: str = SECRET) -> str:
    return jwt.encode(payload, secret, algorithm="HS256")


def _creds(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


# ── get_current_user_id ───────────────────────────────────────────────────────
def test_valid_token_returns_sub():
    token = _token({"sub": "user-1", "role": "USER"})
    assert auth.get_current_user_id(_creds(token)) == "user-1"


def test_missing_credentials_raises_401():
    with pytest.raises(HTTPException) as exc:
        auth.get_current_user_id(None)
    assert exc.value.status_code == 401


def test_token_without_sub_raises_401():
    token = _token({"role": "USER"})
    with pytest.raises(HTTPException) as exc:
        auth.get_current_user_id(_creds(token))
    assert exc.value.status_code == 401


def test_expired_token_raises_401():
    token = _token({"sub": "u1", "exp": datetime.now(timezone.utc) - timedelta(hours=1)})
    with pytest.raises(HTTPException) as exc:
        auth.get_current_user_id(_creds(token))
    assert exc.value.status_code == 401


def test_wrong_secret_raises_401():
    token = _token({"sub": "u1"}, secret="other-secret")
    with pytest.raises(HTTPException):
        auth.get_current_user_id(_creds(token))


# ── get_optional_user_id ──────────────────────────────────────────────────────
def test_optional_returns_none_without_credentials():
    assert auth.get_optional_user_id(None) is None


def test_optional_returns_none_on_invalid_token():
    assert auth.get_optional_user_id(_creds("garbage")) is None


def test_optional_returns_sub_when_valid():
    token = _token({"sub": "u9"})
    assert auth.get_optional_user_id(_creds(token)) == "u9"


# ── require_admin ─────────────────────────────────────────────────────────────
def test_require_admin_allows_admin():
    token = _token({"sub": "a1", "role": "ADMIN"})
    assert auth.require_admin(_creds(token))["role"] == "ADMIN"


def test_require_admin_allows_moderator():
    token = _token({"sub": "m1", "role": "MODERATOR"})
    assert auth.require_admin(_creds(token))["role"] == "MODERATOR"


def test_require_admin_rejects_plain_user():
    token = _token({"sub": "u1", "role": "USER"})
    with pytest.raises(HTTPException) as exc:
        auth.require_admin(_creds(token))
    assert exc.value.status_code == 403
