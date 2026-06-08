"""
Azure AD / Microsoft Entra ID authentication.

Validates the bearer JWT issued by Azure AD against the tenant's JWKS keys.
Access is restricted to the users assigned to the App Registration in Entra ID
("Assignment required" enabled on the Enterprise Application) — this module
only checks that the token is genuine and was issued for our app.

Configuration via environment variables:
    AZURE_TENANT_ID — Directory (tenant) ID from the App Registration overview
    AZURE_CLIENT_ID — Application (client) ID from the App Registration overview
"""

from __future__ import annotations

import os
import time

import requests
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt

TENANT_ID = os.getenv("AZURE_TENANT_ID")
CLIENT_ID = os.getenv("AZURE_CLIENT_ID")

_ISSUER = f"https://login.microsoftonline.com/{TENANT_ID}/v2.0"
_JWKS_URL = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"
_JWKS_TTL = 3600  # seconds

_security = HTTPBearer()
_jwks_cache: dict | None = None
_jwks_fetched_at: float = 0.0


def _get_jwks() -> dict:
    global _jwks_cache, _jwks_fetched_at
    now = time.time()
    if _jwks_cache is None or now - _jwks_fetched_at > _JWKS_TTL:
        resp = requests.get(_JWKS_URL, timeout=10)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        _jwks_fetched_at = now
    return _jwks_cache


def _signing_key(token: str) -> dict:
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")
    for key in _get_jwks().get("keys", []):
        if key.get("kid") == kid:
            return key
    raise HTTPException(status_code=401, detail="Signing key not found for this token")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> dict:
    """FastAPI dependency: validate the Azure AD JWT and return the user's claims."""
    if not TENANT_ID or not CLIENT_ID:
        raise HTTPException(status_code=500, detail="Azure AD authentication is not configured")

    token = credentials.credentials
    try:
        key = _signing_key(token)
        claims = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=CLIENT_ID,
            issuer=_ISSUER,
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}") from exc

    return claims
