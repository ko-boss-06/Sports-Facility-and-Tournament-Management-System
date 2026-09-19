from datetime import datetime, date, time, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import FacilityBooking, Facility, User
from app.schemas.booking import (
    BookingCreate,
    BookingResponse,
    BookingCancel
)
from app.core.permissions import (
    INTERNAL_STUDENT,
    require_roles
)


router = APIRouter(
    prefix="/api/v1/bookings",
    tags=["Facility Bookings"]
)


# ============================================================
# FIXED FACILITY SLOTS
# ============================================================

BOOKING_SLOTS = [
    ("08:00", "09:00"),
    ("09:00", "10:00"),
    ("10:00", "11:00"),
    ("11:00", "12:00"),
    ("12:00", "13:00"),
    ("13:00", "14:00"),
    ("14:00", "15:00"),
    ("15:00", "16:00"),
    ("16:00", "17:00"),
    ("17:00", "18:00"),
    ("18:00", "19:00"),
    ("19:00", "20:00"),
    ("20:00", "21:00"),
]


# ============================================================
# BOOKING WINDOW
#
# Before 10:00 PM:
#     TODAY is available
#
# At/after 10:00 PM:
#     TOMORROW is available
#
# Timezone: India
# ============================================================

INDIA_TIMEZONE = ZoneInfo("Asia/Kolkata")

BOOKING_OPEN_TIME = time(22, 0)


def get_current_india_time():
    """
    Return current India date/time.
    """
    return datetime.now(INDIA_TIMEZONE)


def get_active_booking_date():
    """
    Return the only date currently available for booking.

    Before 10 PM:
        Today

    At or after 10 PM:
        Tomorrow
    """

    now = get_current_india_time()

    if now.time() < BOOKING_OPEN_TIME:
        return now.date()

    return now.date() + timedelta(days=1)


def get_booking_rule_error(booking_date: date):
    """
    Validate whether the requested booking date is
    currently open.
    """

    now = get_current_india_time()

    active_date = get_active_booking_date()

    if booking_date < now.date():
        return "Booking date cannot be in the past."

    if booking_date != active_date:

        if now.time() < BOOKING_OPEN_TIME:

            tomorrow = now.date() + timedelta(days=1)

            if booking_date == tomorrow:
                return (
                    f"Booking for {booking_date} opens "
                    f"at 10:00 PM today."
                )

            return (
                f"You can currently book only for today "
                f"({now.date()})."
            )

        return (
            f"You can currently book only for "
            f"{active_date}."
        )

    return None


def get_slot_times(slot: str):
    """
    Convert slot string into start and end time.
    """

    for start, end in BOOKING_SLOTS:

        if slot == f"{start}-{end}":

            return (
                time.fromisoformat(start),
                time.fromisoformat(end)
            )

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Invalid booking slot"
    )


# ============================================================
# AVAILABILITY
# ============================================================

@router.get("/availability")
def get_booking_availability(
    facility_id: int,
    booking_date: date,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Booking date validation
    # --------------------------------------------------------

    booking_rule_error = get_booking_rule_error(
        booking_date
    )

    if booking_rule_error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=booking_rule_error
        )

    # --------------------------------------------------------
    # Find facility
    # --------------------------------------------------------

    facility = (
        db.query(Facility)
        .filter(Facility.id == facility_id)
        .first()
    )

    if not facility:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found"
        )

    # --------------------------------------------------------
    # Facility availability
    # --------------------------------------------------------

    if not facility.availability_status:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Facility is currently unavailable"
        )

    if facility.maintenance_status != "AVAILABLE":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Facility is currently under maintenance"
        )

    # --------------------------------------------------------
    # Existing bookings
    # --------------------------------------------------------

    bookings = (
        db.query(FacilityBooking)
        .filter(
            FacilityBooking.facility_id == facility_id,
            FacilityBooking.booking_date == booking_date,
            FacilityBooking.status == "CONFIRMED"
        )
        .all()
    )

    booked_slots = {
        (
            booking.start_time.strftime("%H:%M"),
            booking.end_time.strftime("%H:%M")
        )
        for booking in bookings
    }

    # --------------------------------------------------------
    # Generate slots
    # --------------------------------------------------------

    slots = []

    for start, end in BOOKING_SLOTS:

        is_booked = (
            start,
            end
        ) in booked_slots

        slots.append({
            "slot": f"{start}-{end}",
            "start_time": start,
            "end_time": end,
            "available": not is_booked
        })

    # --------------------------------------------------------
    # Booking window information
    # --------------------------------------------------------

    now = get_current_india_time()

    active_date = get_active_booking_date()

    if now.time() < BOOKING_OPEN_TIME:

        booking_window = "TODAY_ONLY"

        booking_opens_at = (
            "Already open since 10:00 PM previous day"
        )

    else:

        booking_window = "NEXT_DAY_ONLY"

        booking_opens_at = (
            "10:00 PM previous day"
        )

    return {
        "facility_id": facility.id,
        "facility_name": facility.name,
        "booking_date": booking_date,
        "booking_window": booking_window,
        "booking_opens_at": booking_opens_at,
        "active_booking_date": active_date,
        "slots": slots
    }


# ============================================================
# CREATE BOOKING
# ============================================================

@router.post(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED
)
def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(INTERNAL_STUDENT)
    )
):

    # --------------------------------------------------------
    # 1. Validate booking date
    # --------------------------------------------------------

    booking_rule_error = get_booking_rule_error(
        booking_data.booking_date
    )

    if booking_rule_error:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=booking_rule_error
        )

    # --------------------------------------------------------
    # 2. Find facility
    # --------------------------------------------------------

    facility = (
        db.query(Facility)
        .filter(
            Facility.id == booking_data.facility_id
        )
        .first()
    )

    if not facility:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Facility not found"
        )

    # --------------------------------------------------------
    # 3. Check facility availability
    # --------------------------------------------------------

    if not facility.availability_status:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Facility is currently unavailable"
        )

    if facility.maintenance_status != "AVAILABLE":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Facility is currently under maintenance"
        )

    # --------------------------------------------------------
    # 4. Validate team requirement
    # --------------------------------------------------------

    team_members = [
        member.strip()
        for member in booking_data.team_members
        if member.strip()
    ]

    if facility.requires_team:

        if not booking_data.team_name.strip():

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Team name is required for this facility"
            )

        if facility.requires_captain:

            if not booking_data.captain_name.strip():

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Captain name is required"
                )

        # ----------------------------------------------------
        # Check member count
        # ----------------------------------------------------

        member_count = len(team_members)

        if member_count < facility.min_team_members:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"This facility requires at least "
                    f"{facility.min_team_members} team members."
                )
            )

        if member_count > facility.max_team_members:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"This facility allows a maximum of "
                    f"{facility.max_team_members} team members."
                )
            )

    else:

        team_members = []

    # --------------------------------------------------------
    # 5. Captain must be part of team members
    # --------------------------------------------------------

    if facility.requires_captain:

        captain_name = booking_data.captain_name.strip()

        captain_exists = any(
            member.lower() == captain_name.lower()
            for member in team_members
        )

        if not captain_exists:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Captain must be included in the team members list."
                )
            )

    # --------------------------------------------------------
    # 6. Convert slot
    # --------------------------------------------------------

    start_time, end_time = get_slot_times(
        booking_data.slot
    )

    # --------------------------------------------------------
    # 7. Check facility slot conflict
    # --------------------------------------------------------

    existing_booking = (
        db.query(FacilityBooking)
        .filter(
            FacilityBooking.facility_id
            == booking_data.facility_id,

            FacilityBooking.booking_date
            == booking_data.booking_date,

            FacilityBooking.start_time
            == start_time,

            FacilityBooking.end_time
            == end_time,

            FacilityBooking.status
            == "CONFIRMED"
        )
        .first()
    )

    if existing_booking:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This slot is already booked"
        )

    # --------------------------------------------------------
    # 8. One student = one booking per day
    # --------------------------------------------------------

    student_daily_booking = (
        db.query(FacilityBooking)
        .filter(
            FacilityBooking.student_id == current_user.id,

            FacilityBooking.booking_date
            == booking_data.booking_date,

            FacilityBooking.status
            == "CONFIRMED"
        )
        .first()
    )

    if student_daily_booking:

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "You already have a facility booking for this day. "
                "A student can book only one slot per day."
            )
        )

    # --------------------------------------------------------
    # 9. Check team members' daily bookings
    # --------------------------------------------------------

    existing_day_bookings = (
        db.query(FacilityBooking)
        .filter(
            FacilityBooking.booking_date
            == booking_data.booking_date,

            FacilityBooking.status
            == "CONFIRMED"
        )
        .all()
    )

    new_members_lower = {
        member.lower()
        for member in team_members
    }

    for existing in existing_day_bookings:

        if not existing.team_members:
            continue

        existing_members = {
            member.strip().lower()
            for member in existing.team_members.split(",")
            if member.strip()
        }

        overlapping_members = (
            new_members_lower.intersection(
                existing_members
            )
        )

        if overlapping_members:

            member_names = ", ".join(
                sorted(overlapping_members)
            )

            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"The following team member(s) already have "
                    f"a facility booking on this day: "
                    f"{member_names}"
                )
            )

    # --------------------------------------------------------
    # 10. Create booking
    # --------------------------------------------------------

    booking = FacilityBooking(
        facility_id=booking_data.facility_id,
        student_id=current_user.id,
        booking_date=booking_data.booking_date,
        start_time=start_time,
        end_time=end_time,

        team_name=booking_data.team_name.strip(),

        captain_name=booking_data.captain_name.strip(),

        team_members=", ".join(team_members),

        status="CONFIRMED"
    )

    db.add(booking)

    db.commit()

    db.refresh(booking)

    return booking


# ============================================================
# VIEW MY BOOKINGS
# ============================================================

@router.get(
    "/my",
    response_model=list[BookingResponse]
)
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(INTERNAL_STUDENT)
    )
):

    bookings = (
        db.query(FacilityBooking)
        .filter(
            FacilityBooking.student_id
            == current_user.id
        )
        .order_by(
            FacilityBooking.booking_date.desc(),
            FacilityBooking.start_time.desc()
        )
        .all()
    )

    return bookings


# ============================================================
# GET SINGLE BOOKING
# ============================================================

@router.get(
    "/{booking_id}",
    response_model=BookingResponse
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(INTERNAL_STUDENT)
    )
):

    booking = (
        db.query(FacilityBooking)
        .filter(
            FacilityBooking.id == booking_id,
            FacilityBooking.student_id
            == current_user.id
        )
        .first()
    )

    if not booking:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    return booking


# ============================================================
# CANCEL BOOKING
# ============================================================

@router.post(
    "/{booking_id}/cancel",
    response_model=BookingResponse
)
def cancel_booking(
    booking_id: int,
    cancellation_data: BookingCancel,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(INTERNAL_STUDENT)
    )
):

    booking = (
        db.query(FacilityBooking)
        .filter(
            FacilityBooking.id == booking_id,
            FacilityBooking.student_id
            == current_user.id
        )
        .first()
    )

    if not booking:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    if booking.status != "CONFIRMED":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only confirmed bookings can be cancelled"
        )

    booking.status = "CANCELLED"

    db.commit()

    db.refresh(booking)

    return booking