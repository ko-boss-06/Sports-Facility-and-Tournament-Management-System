from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from datetime import datetime

from app.database import Base


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    username_or_email = Column(
        String(255),
        nullable=False
    )

    ip_address = Column(
        String(45),
        nullable=True
    )

    success = Column(
        Boolean,
        nullable=False
    )

    attempted_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )