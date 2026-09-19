from datetime import date, time, datetime
from typing import Optional

from pydantic import BaseModel, Field


class BookingCreate(BaseModel):

    # ========================================================
    # FACILITY
    # ========================================================

    facility_id: int = Field(
        ...,
        gt=0
    )

    # ========================================================
    # BOOKING DATE
    # ========================================================

    booking_date: date

    # ========================================================
    # SLOT
    # ========================================================

    slot: str = Field(
        ...,
        pattern=(
            r"^(08:00-09:00|"
            r"09:00-10:00|"
            r"10:00-11:00|"
            r"11:00-12:00|"
            r"12:00-13:00|"
            r"13:00-14:00|"
            r"14:00-15:00|"
            r"15:00-16:00|"
            r"16:00-17:00|"
            r"17:00-18:00|"
            r"18:00-19:00|"
            r"19:00-20:00|"
            r"20:00-21:00)$"
        )
    )

    # ========================================================
    # TEAM DETAILS
    # ========================================================

    team_name: str = Field(
        ...,
        min_length=2,
        max_length=150
    )

    captain_name: str = Field(
        ...,
        min_length=2,
        max_length=150
    )

    team_members: list[str] = Field(
        ...,
        min_length=1
    )


class BookingResponse(BaseModel):

    # ========================================================
    # BOOKING INFORMATION
    # ========================================================

    id: int

    facility_id: int

    student_id: int

    booking_date: date

    start_time: time

    end_time: time

    # ========================================================
    # TEAM INFORMATION
    # ========================================================

    team_name: str

    captain_name: str

    team_members: str

    # ========================================================
    # STATUS
    # ========================================================

    status: str

    created_at: datetime

    updated_at: datetime

    class Config:
        from_attributes = True


class BookingCancel(BaseModel):

    reason: Optional[str] = Field(
        default=None,
        max_length=500
    )