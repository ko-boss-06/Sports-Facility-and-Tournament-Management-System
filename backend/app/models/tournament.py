from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey
)

from app.database import Base


class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(150),
        nullable=False
    )

    sport = Column(
        String(100),
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    proposed_date = Column(
        DateTime,
        nullable=False
    )

    venue = Column(
        String(255),
        nullable=True
    )

    facility_id = Column(
        Integer,
        ForeignKey("facilities.id"),
        nullable=True
    )

    max_teams = Column(
        Integer,
        nullable=False
    )

    registration_deadline = Column(
        DateTime,
        nullable=False
    )

    rules = Column(
        Text,
        nullable=True
    )

    status = Column(
        String(50),
        default="PROPOSED",
        nullable=False
    )

    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    approved_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    rejection_reason = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )