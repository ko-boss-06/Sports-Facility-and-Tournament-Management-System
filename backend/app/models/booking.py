from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    Time,
    DateTime,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database import Base


class FacilityBooking(Base):
    __tablename__ = "facility_bookings"

    # ========================================================
    # BOOKING ID
    # ========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ========================================================
    # FACILITY
    # ========================================================

    facility_id = Column(
        Integer,
        ForeignKey("facilities.id"),
        nullable=False
    )

    # ========================================================
    # STUDENT
    # ========================================================

    student_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    # ========================================================
    # BOOKING DATE
    # ========================================================

    booking_date = Column(
        Date,
        nullable=False
    )

    # ========================================================
    # TIME SLOT
    # ========================================================

    start_time = Column(
        Time,
        nullable=False
    )

    end_time = Column(
        Time,
        nullable=False
    )

    # ========================================================
    # TEAM DETAILS
    # ========================================================

    team_name = Column(
        String(150),
        nullable=False
    )

    captain_name = Column(
        String(150),
        nullable=False
    )

    # Stored as comma-separated member names
    #
    # Example:
    # "Test Captain, Member 2, Member 3, Member 4"
    #
    team_members = Column(
        String(1000),
        nullable=False
    )

    # ========================================================
    # STATUS
    # ========================================================

    status = Column(
        String(30),
        default="CONFIRMED",
        nullable=False
    )

    # ========================================================
    # TIMESTAMPS
    # ========================================================

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

    # ========================================================
    # RELATIONSHIPS
    # ========================================================

    facility = relationship(
        "Facility"
    )

    student = relationship(
        "User"
    )