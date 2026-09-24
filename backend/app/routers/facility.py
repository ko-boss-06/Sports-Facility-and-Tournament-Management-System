from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Facility, User
from app.schemas.facility import (
    FacilityCreate,
    FacilityUpdate,
    FacilityResponse
)
from app.core.permissions import PE, require_roles
from app.core.dependencies import get_current_user


router = APIRouter(
    prefix="/api/v1/facilities",
    tags=["Facilities"]
)


# =========================================================
# CREATE FACILITY
# Only PE can create
# =========================================================

@router.post(
    "",
    response_model=FacilityResponse,
    status_code=status.HTTP_201_CREATED
)
def create_facility(
    facility_data: FacilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(PE))
):

    facility = Facility(
        name=facility_data.name,
        facility_type=facility_data.facility_type,
        sport=facility_data.sport,
        location=facility_data.location,
        capacity=facility_data.capacity,
        description=facility_data.description,

        availability_status=True,
        maintenance_status="AVAILABLE",

        requires_team=facility_data.requires_team,
        requires_captain=facility_data.requires_captain,
        min_team_members=facility_data.min_team_members,
        max_team_members=facility_data.max_team_members
    )

    db.add(facility)

    db.commit()

    db.refresh(facility)

    return facility


# =========================================================
# GET ALL FACILITIES
# Any logged-in user can view
# =========================================================

@router.get(
    "",
    response_model=list[FacilityResponse]
)
def get_facilities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    facilities = (
        db.query(Facility)
        .order_by(Facility.id)
        .all()
    )

    return facilities


# =========================================================
# GET ONE FACILITY
# Any logged-in user can view
# =========================================================

@router.get(
    "/{facility_id}",
    response_model=FacilityResponse
)
def get_facility(
    facility_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

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

    return facility


# =========================================================
# UPDATE FACILITY
# Only PE can update
# =========================================================

@router.put(
    "/{facility_id}",
    response_model=FacilityResponse
)
def update_facility(
    facility_id: int,
    facility_data: FacilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(PE))
):

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

    update_data = facility_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():

        setattr(
            facility,
            field,
            value
        )

    db.commit()

    db.refresh(facility)

    return facility


# =========================================================
# DEACTIVATE FACILITY
# Only PE can deactivate
# =========================================================

@router.patch(
    "/{facility_id}/deactivate",
    response_model=FacilityResponse
)
def deactivate_facility(
    facility_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(PE))
):

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

    facility.availability_status = False

    db.commit()

    db.refresh(facility)

    return facility


# =========================================================
# DELETE FACILITY
# Only PE can delete
# =========================================================

@router.delete(
    "/{facility_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_facility(
    facility_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(PE))
):

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

    db.delete(facility)

    db.commit()

    return None