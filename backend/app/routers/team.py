from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Team, TeamMember, Tournament, User
from app.schemas.team import (
    TeamCreate,
    ExternalTeamCreate,
    TeamResponse,
    TeamReject
)
from app.core.dependencies import get_current_user
from app.core.permissions import (
    INTERNAL_STUDENT,
    PE,
    require_roles
)


router = APIRouter(
    prefix="/api/v1/teams",
    tags=["Teams"]
)


# ---------------------------------------------------------
# INTERNAL STUDENT - Register Team
# ---------------------------------------------------------
@router.post(
    "/internal",
    response_model=TeamResponse,
    status_code=status.HTTP_201_CREATED
)
def register_internal_team(
    team_data: TeamCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(INTERNAL_STUDENT)
    )
):
    tournament = (
        db.query(Tournament)
        .filter(Tournament.id == team_data.tournament_id)
        .first()
    )

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )

    # Tournament must be approved
    if tournament.status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Team registration is available only "
                "for approved tournaments"
            )
        )

    # Registration deadline validation
    if datetime.utcnow() > tournament.registration_deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team registration deadline has passed"
        )

    # Check duplicate team name
    existing_team = (
        db.query(Team)
        .filter(
            Team.tournament_id == team_data.tournament_id,
            Team.team_name == team_data.team_name
        )
        .first()
    )

    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "A team with this name is already "
                "registered for this tournament"
            )
        )

    # Check maximum team limit
    team_count = (
        db.query(Team)
        .filter(
            Team.tournament_id == team_data.tournament_id,
            Team.status != "REJECTED"
        )
        .count()
    )

    if team_count >= tournament.max_teams:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum team registration limit has been reached"
        )

    # Create team
    team = Team(
        tournament_id=team_data.tournament_id,
        team_name=team_data.team_name,
        captain_name=team_data.captain_name,
        captain_email=team_data.captain_email,
        captain_phone=team_data.captain_phone,
        registration_type="INTERNAL",
        status="PENDING",
        registered_by=current_user.id
    )

    db.add(team)
    db.flush()

    # Add team members
    for member_data in team_data.members:
        member = TeamMember(
            team_id=team.id,
            name=member_data.name,
            student_id=member_data.student_id,
            email=member_data.email,
            phone=member_data.phone,
            role=member_data.role
        )

        db.add(member)

    db.commit()
    db.refresh(team)

    return team


# ---------------------------------------------------------
# EXTERNAL STUDENT - Register Team
# No Login Required
# ---------------------------------------------------------
@router.post(
    "/external",
    response_model=TeamResponse,
    status_code=status.HTTP_201_CREATED
)
def register_external_team(
    team_data: ExternalTeamCreate,
    db: Session = Depends(get_db)
):
    tournament = (
        db.query(Tournament)
        .filter(Tournament.id == team_data.tournament_id)
        .first()
    )

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )

    # Tournament must be approved
    if tournament.status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Team registration is available only "
                "for approved tournaments"
            )
        )

    # Registration deadline validation
    if datetime.utcnow() > tournament.registration_deadline:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team registration deadline has passed"
        )

    # Check duplicate team name
    existing_team = (
        db.query(Team)
        .filter(
            Team.tournament_id == team_data.tournament_id,
            Team.team_name == team_data.team_name
        )
        .first()
    )

    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "A team with this name is already "
                "registered for this tournament"
            )
        )

    # Check maximum team limit
    team_count = (
        db.query(Team)
        .filter(
            Team.tournament_id == team_data.tournament_id,
            Team.status != "REJECTED"
        )
        .count()
    )

    if team_count >= tournament.max_teams:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum team registration limit has been reached"
        )

    # Create external team
    team = Team(
        tournament_id=team_data.tournament_id,
        team_name=team_data.team_name,
        captain_name=team_data.captain_name,
        captain_email=team_data.captain_email,
        captain_phone=team_data.captain_phone,
        registration_type="EXTERNAL",
        status="PENDING",
        registered_by=None,
        external_contact=team_data.external_contact
    )

    db.add(team)
    db.flush()

    # Add team members
    for member_data in team_data.members:
        member = TeamMember(
            team_id=team.id,
            name=member_data.name,
            student_id=member_data.student_id,
            email=member_data.email,
            phone=member_data.phone,
            role=member_data.role
        )

        db.add(member)

    db.commit()
    db.refresh(team)

    return team


# ---------------------------------------------------------
# PE - View Pending Team Registrations
# ---------------------------------------------------------
@router.get(
    "/pending-approval",
    response_model=list[TeamResponse]
)
def get_pending_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(PE)
    )
):
    teams = (
        db.query(Team)
        .filter(Team.status == "PENDING")
        .order_by(Team.created_at.desc())
        .all()
    )

    return teams


# ---------------------------------------------------------
# PE - Approve Team
# ---------------------------------------------------------
@router.post(
    "/{team_id}/approve",
    response_model=TeamResponse
)
def approve_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(PE)
    )
):
    team = (
        db.query(Team)
        .filter(Team.id == team_id)
        .first()
    )

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    if team.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Only PENDING teams can be approved. "
                f"Current status: {team.status}"
            )
        )

    team.status = "APPROVED"
    team.rejection_reason = None

    db.commit()
    db.refresh(team)

    return team


# ---------------------------------------------------------
# PE - Reject Team
# ---------------------------------------------------------
@router.post(
    "/{team_id}/reject",
    response_model=TeamResponse
)
def reject_team(
    team_id: int,
    rejection_data: TeamReject,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(PE)
    )
):
    team = (
        db.query(Team)
        .filter(Team.id == team_id)
        .first()
    )

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    if team.status != "PENDING":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Only PENDING teams can be rejected. "
                f"Current status: {team.status}"
            )
        )

    team.status = "REJECTED"
    team.rejection_reason = rejection_data.rejection_reason

    db.commit()
    db.refresh(team)

    return team


# ---------------------------------------------------------
# AUTHENTICATED USERS - View Team
# ---------------------------------------------------------
@router.get(
    "/{team_id}",
    response_model=TeamResponse
)
def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):
    team = (
        db.query(Team)
        .filter(Team.id == team_id)
        .first()
    )

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    return team