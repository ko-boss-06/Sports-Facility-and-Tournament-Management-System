from pydantic import BaseModel, Field
from typing import Optional


class FacilityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    facility_type: str = Field(..., min_length=1, max_length=100)
    sport: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=255)
    capacity: Optional[int] = Field(default=None, gt=0)
    description: Optional[str] = None


class FacilityCreate(FacilityBase):
    pass


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


class FacilityResponse(FacilityBase):
    id: int
    availability_status: bool
    maintenance_status: str

    class Config:
        from_attributes = True