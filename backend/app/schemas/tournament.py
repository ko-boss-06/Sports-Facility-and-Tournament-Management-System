from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# =========================================================
# TOURNAMENT BASE
# Common fields used by TournamentCreate and TournamentResponse
# =========================================================

class TournamentBase(BaseModel):

    name: str = Field(
        ...,
        min_length=1,
        max_length=150
    )

    sport: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    description: Optional[str] = None

    proposed_date: datetime

    venue: Optional[str] = Field(
        default=None,
        max_length=255
    )

    facility_id: Optional[int] = Field(
        default=None,
        gt=0
    )

    max_teams: int = Field(
        ...,
        gt=0
    )

    registration_deadline: datetime

    rules: Optional[str] = None


# =========================================================
# TOURNAMENT CREATE
# Used by Coach when creating a tournament proposal
# =========================================================

class TournamentCreate(TournamentBase):
    pass


# =========================================================
# TOURNAMENT UPDATE
# Used by Sports Coordinator to manage
# an APPROVED tournament
# =========================================================

class TournamentUpdate(BaseModel):

    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150
    )

    sport: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    description: Optional[str] = None

    proposed_date: Optional[datetime] = None

    venue: Optional[str] = Field(
        default=None,
        max_length=255
    )

    facility_id: Optional[int] = Field(
        default=None,
        gt=0
    )

    max_teams: Optional[int] = Field(
        default=None,
        gt=0
    )

    registration_deadline: Optional[datetime] = None

    rules: Optional[str] = None


# =========================================================
# TOURNAMENT REJECT
# Used by PE when rejecting a tournament proposal
# =========================================================

class TournamentReject(BaseModel):

    rejection_reason: str = Field(
        ...,
        min_length=1,
        max_length=1000
    )


# =========================================================
# TOURNAMENT RESPONSE
# Response returned by the API
# =========================================================

class TournamentResponse(TournamentBase):

    id: int

    status: str

    created_by: int

    approved_by: Optional[int] = None

    rejection_reason: Optional[str] = None

    created_at: datetime

    updated_at: datetime

    class Config:
        from_attributes = True