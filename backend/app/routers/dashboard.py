from fastapi import APIRouter, Depends

from app.models import User
from app.core.dependencies import get_current_user
from app.core.permissions import (
    require_roles,
    PE,
    SPORTS_COORDINATOR,
    COACH,
    INTERNAL_STUDENT,
    EQUIPMENT_MANAGER
)


router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboards"]
)


@router.get("/me")
def my_dashboard(
    current_user: User = Depends(get_current_user)
):
    return {
        "message": "Welcome to your dashboard",
        "user": current_user.username,
        "role": current_user.role.name
    }


@router.get("/pe")
def pe_dashboard(
    current_user: User = Depends(
        require_roles(PE)
    )
):
    return {
        "message": "Welcome to PE Dashboard",
        "user": current_user.username,
        "role": current_user.role.name
    }


@router.get("/coordinator")
def coordinator_dashboard(
    current_user: User = Depends(
        require_roles(SPORTS_COORDINATOR)
    )
):
    return {
        "message": "Welcome to Sports Coordinator Dashboard",
        "user": current_user.username,
        "role": current_user.role.name
    }


@router.get("/coach")
def coach_dashboard(
    current_user: User = Depends(
        require_roles(COACH)
    )
):
    return {
        "message": "Welcome to Coach Dashboard",
        "user": current_user.username,
        "role": current_user.role.name
    }


@router.get("/student")
def student_dashboard(
    current_user: User = Depends(
        require_roles(INTERNAL_STUDENT)
    )
):
    return {
        "message": "Welcome to Internal Student Dashboard",
        "user": current_user.username,
        "role": current_user.role.name
    }


@router.get("/equipment")
def equipment_dashboard(
    current_user: User = Depends(
        require_roles(EQUIPMENT_MANAGER)
    )
):
    return {
        "message": "Welcome to Equipment Manager Dashboard",
        "user": current_user.username,
        "role": current_user.role.name
    }