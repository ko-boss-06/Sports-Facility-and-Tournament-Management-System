from fastapi import Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.models import User


# All roles in the system
PE = "PE"
SPORTS_COORDINATOR = "SPORTS_COORDINATOR"
COACH = "COACH"
INTERNAL_STUDENT = "INTERNAL_STUDENT"
EQUIPMENT_MANAGER = "EQUIPMENT_MANAGER"


def require_roles(*allowed_roles: str):

    def role_checker(
        current_user: User = Depends(get_current_user)
    ) -> User:

        if current_user.role.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )

        return current_user

    return role_checker