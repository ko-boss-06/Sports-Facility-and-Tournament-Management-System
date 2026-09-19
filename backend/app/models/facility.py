from datetime import datetime

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from app.database import Base


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(Integer, primary_key=True, index=True)

    # Basic facility information
    name = Column(String(100), nullable=False)
    facility_type = Column(String(100), nullable=False)
    sport = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    capacity = Column(Integer, nullable=True)

    # Facility availability
    availability_status = Column(
        Boolean,
        default=True,
        nullable=False
    )

    maintenance_status = Column(
        String(50),
        default="AVAILABLE",
        nullable=False
    )

    description = Column(Text, nullable=True)

    # ---------------------------------------------------------
    # TEAM BOOKING CONFIGURATION
    # ---------------------------------------------------------

    # Whether this facility requires a team for booking
    requires_team = Column(
        Boolean,
        default=True,
        nullable=False
    )

    # Whether every booking must have a captain
    requires_captain = Column(
        Boolean,
        default=True,
        nullable=False
    )

    # Minimum number of members required for this facility
    min_team_members = Column(
        Integer,
        default=1,
        nullable=False
    )

    # Maximum number of members allowed for this facility
    max_team_members = Column(
        Integer,
        default=1,
        nullable=False
    )

    # Timestamps
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