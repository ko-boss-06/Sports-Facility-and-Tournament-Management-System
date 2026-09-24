from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Tournament, User
from app.schemas.tournament import (
    TournamentCreate,
    TournamentResponse,
    TournamentReject
)
from app.core.permissions import (
    PE,
    COACH,
    SPORTS_COORDINATOR,
    require_roles
)


router = APIRouter(
    prefix="/api/v1/tournaments",
    tags=["Tournaments"]
)


# =========================================================
# COACH - CREATE TOURNAMENT PROPOSAL
# =========================================================

@router.post(
    "/proposals",
    response_model=TournamentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_tournament_proposal(
    tournament_data: TournamentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(COACH)
    )
):

    # Registration deadline must be before tournament date
    if (
        tournament_data.registration_deadline
        >= tournament_data.proposed_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Registration deadline must be before "
                "the proposed tournament date"
            )
        )

    tournament = Tournament(
        name=tournament_data.name,
        sport=tournament_data.sport,
        description=tournament_data.description,
        proposed_date=tournament_data.proposed_date,
        venue=tournament_data.venue,
        facility_id=tournament_data.facility_id,
        max_teams=tournament_data.max_teams,
        registration_deadline=tournament_data.registration_deadline,
        rules=tournament_data.rules,
        status="PROPOSED",
        created_by=current_user.id
    )

    db.add(tournament)
    db.commit()
    db.refresh(tournament)

    return tournament


# =========================================================
# COACH - VIEW OWN TOURNAMENT PROPOSALS
# =========================================================

@router.get(
    "/my-proposals",
    response_model=list[TournamentResponse]
)
def get_my_tournament_proposals(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(COACH)
    )
):

    proposals = (
        db.query(Tournament)
        .filter(
            Tournament.created_by == current_user.id
        )
        .order_by(
            Tournament.created_at.desc()
        )
        .all()
    )

    return proposals


# =========================================================
# SPORTS COORDINATOR - VIEW ALL TOURNAMENT PROPOSALS
# =========================================================

@router.get(
    "/proposals",
    response_model=list[TournamentResponse]
)
def get_tournament_proposals(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(SPORTS_COORDINATOR)
    )
):

    proposals = (
        db.query(Tournament)
        .order_by(
            Tournament.created_at.desc()
        )
        .all()
    )

    return proposals


# =========================================================
# SPORTS COORDINATOR - VIEW APPROVED TOURNAMENTS
# =========================================================

@router.get(
    "/approved",
    response_model=list[TournamentResponse]
)
def get_approved_tournaments(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(SPORTS_COORDINATOR)
    )
):

    tournaments = (
        db.query(Tournament)
        .filter(
            Tournament.status == "APPROVED"
        )
        .order_by(
            Tournament.proposed_date.asc()
        )
        .all()
    )

    return tournaments


# =========================================================
# PE - VIEW TOURNAMENTS WAITING FOR APPROVAL
# =========================================================

@router.get(
    "/pending-approval",
    response_model=list[TournamentResponse]
)
def get_pending_approval_tournaments(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(PE)
    )
):

    tournaments = (
        db.query(Tournament)
        .filter(
            Tournament.status == "FORWARDED"
        )
        .order_by(
            Tournament.created_at.desc()
        )
        .all()
    )

    return tournaments


# =========================================================
# SPORTS COORDINATOR - FORWARD PROPOSAL TO PE
# =========================================================

@router.post(
    "/proposals/{tournament_id}/forward",
    response_model=TournamentResponse
)
def forward_tournament_proposal(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(SPORTS_COORDINATOR)
    )
):

    tournament = (
        db.query(Tournament)
        .filter(
            Tournament.id == tournament_id
        )
        .first()
    )

    if not tournament:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament proposal not found"
        )

    if tournament.status != "PROPOSED":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only PROPOSED tournaments can be forwarded. "
                f"Current status: {tournament.status}"
            )
        )

    tournament.status = "FORWARDED"

    db.commit()
    db.refresh(tournament)

    return tournament


# =========================================================
# PE - APPROVE TOURNAMENT PROPOSAL
# =========================================================

@router.post(
    "/proposals/{tournament_id}/approve",
    response_model=TournamentResponse
)
def approve_tournament_proposal(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(PE)
    )
):

    tournament = (
        db.query(Tournament)
        .filter(
            Tournament.id == tournament_id
        )
        .first()
    )

    if not tournament:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament proposal not found"
        )

    if tournament.status != "FORWARDED":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only FORWARDED tournaments can be approved. "
                f"Current status: {tournament.status}"
            )
        )

    tournament.status = "APPROVED"

    tournament.approved_by = current_user.id

    tournament.rejection_reason = None

    db.commit()
    db.refresh(tournament)

    return tournament


# =========================================================
# PE - REJECT TOURNAMENT PROPOSAL
# =========================================================

@router.post(
    "/proposals/{tournament_id}/reject",
    response_model=TournamentResponse
)
def reject_tournament_proposal(
    tournament_id: int,
    rejection_data: TournamentReject,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(PE)
    )
):

    tournament = (
        db.query(Tournament)
        .filter(
            Tournament.id == tournament_id
        )
        .first()
    )

    if not tournament:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament proposal not found"
        )

    if tournament.status != "FORWARDED":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only FORWARDED tournaments can be rejected. "
                f"Current status: {tournament.status}"
            )
        )

    tournament.status = "REJECTED"

    tournament.approved_by = None

    tournament.rejection_reason = (
        rejection_data.rejection_reason
    )

    db.commit()
    db.refresh(tournament)

    return tournament


# =========================================================
# SPORTS COORDINATOR / COACH / PE
# VIEW ONE TOURNAMENT
# =========================================================

@router.get(
    "/{tournament_id}",
    response_model=TournamentResponse
)
def get_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            SPORTS_COORDINATOR,
            COACH,
            PE
        )
    )
):

    tournament = (
        db.query(Tournament)
        .filter(
            Tournament.id == tournament_id
        )
        .first()
    )

    if not tournament:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )

    return tournament