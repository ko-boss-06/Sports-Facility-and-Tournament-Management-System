from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    identifier: str = Field(
        ...,
        min_length=1,
        description="Username or email address"
    )
    password: str = Field(
        ...,
        min_length=1,
        description="Account password"
    )


class UserResponse(BaseModel):
    id: int
    name: str
    username: str
    email: EmailStr
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class ForgotPasswordRequest(BaseModel):
    identifier: str = Field(
        ...,
        min_length=1,
        description="Username or email address"
    )


class ForgotPasswordResponse(BaseModel):
    message: str

class ResetPasswordRequest(BaseModel):
    token: str = Field(
        ...,
        min_length=1,
        description="Password reset token"
    )

    new_password: str = Field(
        ...,
        min_length=8,
        description="New password"
    )


class ResetPasswordResponse(BaseModel):
    message: str