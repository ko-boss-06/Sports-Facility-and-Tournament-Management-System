from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models import (
    Role,
    User,
    LoginAttempt,
    PasswordResetToken,
    Facility,
    Tournament,
    Team,
    TeamMember,
    FacilityBooking
)
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from app.routers.facility import router as facility_router
from app.routers.tournament import router as tournament_router
from app.routers.team import router as team_router
from app.routers.public import router as public_router
from app.routers.booking import router as booking_router


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="Sports Facility and Tournament Management System",
    version="1.0.0"
)


# Allow React frontend to communicate with FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include application routers
app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(facility_router)
app.include_router(tournament_router)
app.include_router(team_router)
app.include_router(public_router)
app.include_router(booking_router)


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Sports Facility and Tournament Management System API is running"
    }


# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }