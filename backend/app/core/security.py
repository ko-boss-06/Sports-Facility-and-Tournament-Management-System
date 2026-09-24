from datetime import datetime, timezone

from jose import JWTError, jwt
from pwdlib import PasswordHash

from app.config import settings


# ============================================================
# PASSWORD HASHING
# ============================================================

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Convert a plain password into a secure Argon2 hash."""
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Check a plain password against its stored hash."""
    return password_hash.verify(password, hashed_password)


# ============================================================
# CREATE ACCESS TOKEN
# ============================================================

def create_access_token(data: dict) -> str:
    """
    Create a JWT access token.

    The token does not have an automatic expiration time.
    The user remains logged in until they explicitly log out.
    """

    to_encode = data.copy()

    # Add token creation time
    to_encode.update({
        "iat": datetime.now(timezone.utc)
    })

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


# ============================================================
# DECODE ACCESS TOKEN
# ============================================================

def decode_access_token(token: str) -> dict | None:
    """Decode and verify a JWT token."""

    try:

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        return payload

    except JWTError:

        return None