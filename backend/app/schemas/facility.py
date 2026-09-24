from pydantic import BaseModel, Field
from typing import Optional


# =========================================================
# FACILITY BASE
# =========================================================

class FacilityBase(BaseModel):

    name: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    facility_type: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    sport: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    location: str = Field(
        ...,
        min_length=1,
        max_length=255
    )

    capacity: Optional[int] = Field(
        default=None,
        gt=0
    )

    description: Optional[str] = None

    # =====================================================
    # TEAM REQUIREMENTS
    # =====================================================

    requires_team: bool = False

    requires_captain: bool = False

    min_team_members: Optional[int] = Field(
        default=None,
        gt=0
    )

    max_team_members: Optional[int] = Field(
        default=None,
        gt=0
    )


# =========================================================
# CREATE FACILITY
# =========================================================

class FacilityCreate(FacilityBase):
    pass


# =========================================================
# UPDATE FACILITY
# =========================================================

class FacilityUpdate(BaseModel):

    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    facility_type: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    sport: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    location: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=255
    )

    capacity: Optional[int] = Field(
        default=None,
        gt=0
    )

    availability_status: Optional[bool] = None

    maintenance_status: Optional[str] = Field(
        default=None,
        max_length=50
    )

    description: Optional[str] = None

    # =====================================================
    # TEAM REQUIREMENTS
    # =====================================================

    requires_team: Optional[bool] = None

    requires_captain: Optional[bool] = None

    min_team_members: Optional[int] = Field(
        default=None,
        gt=0
    )

    max_team_members: Optional[int] = Field(
        default=None,
        gt=0
    )


# =========================================================
# FACILITY RESPONSE
# =========================================================

class FacilityResponse(FacilityBase):

    id: int

    availability_status: bool

    maintenance_status: str

    class Config:
        from_attributes = True