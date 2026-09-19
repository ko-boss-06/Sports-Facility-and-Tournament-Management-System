from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, LoginAttempt, PasswordResetToken
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    UserResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse
)
from app.core.security import (
    verify_password,
    create_access_token,
    hash_password
)
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)


RESET_TOKEN_EXPIRE_MINUTES = 15


# ==========================================
# LOGIN
# ==========================================

@router.post(
    "/login",
    response_model=LoginResponse
)
def login(
    request: Request,
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    # --------------------------------
    # Get IP address
    # --------------------------------

    ip_address = request.client.host if request.client else None

    # --------------------------------
    # 1. Find user by username OR email
    # --------------------------------

    user = db.query(User).filter(
        or_(
            User.username == login_data.identifier,
            User.email == login_data.identifier
        )
    ).first()

    # --------------------------------
    # 2. User does not exist
    # --------------------------------

    if not user:

        attempt = LoginAttempt(
            user_id=None,
            username_or_email=login_data.identifier,
            ip_address=ip_address,
            success=False
        )

        db.add(attempt)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password"
        )

    # --------------------------------
    # 3. Check active account
    # --------------------------------

    if not user.is_active:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is inactive"
        )

    # --------------------------------
    # 4. Verify password
    # --------------------------------

    password_valid = verify_password(
        login_data.password,
        user.password_hash
    )

    # --------------------------------
    # 5. Invalid password
    # --------------------------------

    if not password_valid:

        attempt = LoginAttempt(
            user_id=user.id,
            username_or_email=login_data.identifier,
            ip_address=ip_address,
            success=False
        )

        db.add(attempt)
        db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password"
        )

    # --------------------------------
    # 6. Successful login
    # --------------------------------

    user.failed_login_attempts = 0
    user.locked_until = None
    user.last_login = datetime.now(timezone.utc).replace(
        tzinfo=None
    )

    # Record successful login attempt
    attempt = LoginAttempt(
        user_id=user.id,
        username_or_email=login_data.identifier,
        ip_address=ip_address,
        success=True
    )

    db.add(attempt)

    # --------------------------------
    # 7. Create JWT access token
    # --------------------------------

    access_token = create_access_token(
        {
            "sub": str(user.id),
            "username": user.username,
            "role": user.role.name
        }
    )

    db.commit()

    # --------------------------------
    # 8. Return response
    # --------------------------------

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            name=user.name,
            username=user.username,
            email=user.email,
            role=user.role.name
        )
    )


# ==========================================
# FORGOT PASSWORD
# ==========================================

@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse
)
def forgot_password(
    request_data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    # --------------------------------
    # 1. Find user by username OR email
    # --------------------------------

    user = db.query(User).filter(
        or_(
            User.username == request_data.identifier,
            User.email == request_data.identifier
        )
    ).first()

    # --------------------------------
    # 2. Generic response
    # --------------------------------
    # We do not reveal whether the account exists.
    # This prevents username/email enumeration.

    if not user:
        return ForgotPasswordResponse(
            message=(
                "If an account exists with this "
                "username or email, a password reset "
                "request has been created."
            )
        )

    # --------------------------------
    # 3. Generate secure random token
    # --------------------------------

    reset_token = secrets.token_urlsafe(32)

    # --------------------------------
    # 4. Hash the token before storing
    # --------------------------------

    token_hash = hashlib.sha256(
        reset_token.encode("utf-8")
    ).hexdigest()

    # --------------------------------
    # 5. Set expiration time
    # --------------------------------

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    )

    expires_at = expires_at.replace(
        tzinfo=None
    )

    # --------------------------------
    # 6. Create password reset record
    # --------------------------------

    reset_record = PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at
    )

    db.add(reset_record)
    db.commit()

    # --------------------------------
    # 7. Development response
    # --------------------------------
    # In production this token would be sent
    # through email/SMS instead.

    return ForgotPasswordResponse(
        message=(
            "Password reset request created successfully. "
            f"Development reset token: {reset_token}"
        )
    )


# ==========================================
# RESET PASSWORD
# ==========================================

@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse
)
def reset_password(
    request_data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    # --------------------------------
    # 1. Hash the supplied reset token
    # --------------------------------

    token_hash = hashlib.sha256(
        request_data.token.encode("utf-8")
    ).hexdigest()

    # --------------------------------
    # 2. Find the reset token
    # --------------------------------

    reset_record = db.query(
        PasswordResetToken
    ).filter(
        PasswordResetToken.token_hash == token_hash
    ).first()

    if not reset_record:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token"
        )

    # --------------------------------
    # 3. Check whether token was used
    # --------------------------------

    if reset_record.used_at is not None:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This password reset token has already been used"
        )

    # --------------------------------
    # 4. Check token expiration
    # --------------------------------

    now = datetime.now(timezone.utc)

    expires_at = reset_record.expires_at

    if expires_at.tzinfo is None:

        expires_at = expires_at.replace(
            tzinfo=timezone.utc
        )

    if expires_at <= now:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token"
        )

    # --------------------------------
    # 5. Find user
    # --------------------------------

    user = db.query(User).filter(
        User.id == reset_record.user_id
    ).first()

    if not user:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to reset password"
        )

    # --------------------------------
    # 6. Hash new password
    # --------------------------------

    user.password_hash = hash_password(
        request_data.new_password
    )

    # --------------------------------
    # 7. Reset login attempt counter
    # --------------------------------

    user.failed_login_attempts = 0
    user.locked_until = None

    # --------------------------------
    # 8. Mark token as used
    # --------------------------------

    reset_record.used_at = now.replace(
        tzinfo=None
    )

    # --------------------------------
    # 9. Save changes
    # --------------------------------

    db.commit()

    return ResetPasswordResponse(
        message="Password reset successfully"
    )


# ==========================================
# GET CURRENT USER
# ==========================================

@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role.name
    )


# ==========================================
# LOGOUT
# ==========================================

@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user)
):
    return {
        "message": "Logout successful",
        "user": current_user.username
    }