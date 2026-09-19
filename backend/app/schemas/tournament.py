from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TournamentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    sport: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    proposed_date: datetime
    venue: Optional[str] = Field(default=None, max_length=255)
    facility_id: Optional[int] = Field(default=None, gt=0)
    max_teams: int = Field(..., gt=0)
    registration_deadline: datetime
    rules: Optional[str] = None


class TournamentCreate(TournamentBase):
    pass


class TournamentUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    sport: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    proposed_date: Optional[datetime] = None
    venue: Optional[str] = Field(default=None, max_length=255)
    facility_id: Optional[int] = Field(default=None, gt=0)
    max_teams: Optional[int] = Field(default=None, gt=0)
    registration_deadline: Optional[datetime] = None
    rules: Optional[str] = None


class TournamentReject(BaseModel):
    rejection_reason: str = Field(
        ...,
        min_length=1,
        max_length=1000
    )


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