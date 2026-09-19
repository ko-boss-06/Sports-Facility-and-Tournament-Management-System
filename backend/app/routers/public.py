from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Tournament


router = APIRouter(
    prefix="/api/v1/public",
    tags=["Public"]
)


@router.get(
    "/tournaments"
)
def get_public_tournaments(
    db: Session = Depends(get_db)
):
    tournaments = (
        db.query(Tournament)
        .filter(Tournament.status == "APPROVED")
        .order_by(Tournament.proposed_date.asc())
        .all()
    )

    return tournaments


@router.get(
    "/tournaments/{tournament_id}"
)
def get_public_tournament(
    tournament_id: int,
    db: Session = Depends(get_db)
):
    tournament = (
        db.query(Tournament)
        .filter(
            Tournament.id == tournament_id,
            Tournament.status == "APPROVED"
        )
        .first()
    )

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approved tournament not found"
        )

    return tournament