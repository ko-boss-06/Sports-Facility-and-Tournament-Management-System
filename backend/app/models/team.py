from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text
)

from sqlalchemy.orm import relationship

from app.database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    tournament_id = Column(
        Integer,
        ForeignKey("tournaments.id"),
        nullable=False
    )

    team_name = Column(
        String(150),
        nullable=False
    )

    captain_name = Column(
        String(100),
        nullable=False
    )

    captain_email = Column(
        String(255),
        nullable=False
    )

    captain_phone = Column(
        String(20),
        nullable=False
    )

    registration_type = Column(
        String(20),
        nullable=False
    )

    status = Column(
        String(20),
        default="PENDING",
        nullable=False
    )

    registered_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    external_contact = Column(
        String(255),
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

    # Team → Team Members relationship
    members = relationship(
        "TeamMember",
        back_populates="team",
        cascade="all, delete-orphan"
    )


class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    team_id = Column(
        Integer,
        ForeignKey("teams.id"),
        nullable=False
    )

    name = Column(
        String(100),
        nullable=False
    )

    student_id = Column(
        String(100),
        nullable=True
    )

    email = Column(
        String(255),
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=True
    )

    role = Column(
        String(50),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # Team Member → Team relationship
    team = relationship(
        "Team",
        back_populates="members"
    )