from pydantic import BaseModel, Field
from typing import Optional


class TeamMemberCreate(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    student_id: Optional[str] = Field(
        default=None,
        max_length=100
    )

    email: str = Field(
        ...,
        min_length=1,
        max_length=255
    )

    phone: Optional[str] = Field(
        default=None,
        max_length=20
    )

    role: str = Field(
        ...,
        min_length=1,
        max_length=50
    )


class TeamCreate(BaseModel):
    tournament_id: int = Field(
        ...,
        gt=0
    )

    team_name: str = Field(
        ...,
        min_length=1,
        max_length=150
    )

    captain_name: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    captain_email: str = Field(
        ...,
        min_length=1,
        max_length=255
    )

    captain_phone: str = Field(
        ...,
        min_length=1,
        max_length=20
    )

    members: list[TeamMemberCreate] = Field(
        default_factory=list
    )


class ExternalTeamCreate(TeamCreate):
    external_contact: str = Field(
        ...,
        min_length=1,
        max_length=255
    )


class TeamMemberResponse(BaseModel):
    id: int
    name: str
    student_id: Optional[str]
    email: str
    phone: Optional[str]
    role: str

    class Config:
        from_attributes = True


class TeamResponse(BaseModel):
    id: int
    tournament_id: int
    team_name: str
    captain_name: str
    captain_email: str
    captain_phone: str
    registration_type: str
    status: str
    registered_by: Optional[int]
    external_contact: Optional[str]
    rejection_reason: Optional[str]
    members: list[TeamMemberResponse] = []

    class Config:
        from_attributes = True


class TeamReject(BaseModel):
    rejection_reason: str = Field(
        ...,
        min_length=1,
        max_length=1000
    )

class ExternalTeamStatusRequest(BaseModel):
    team_id: int = Field(
        ...,
        gt=0
    )

    external_contact: str = Field(
        ...,
        min_length=1,
        max_length=255
    )