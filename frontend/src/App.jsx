import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import "./App.css";

import { loginUser } from "./api/auth";

// =========================================================
// DASHBOARDS
// =========================================================

import PEDashboard from "./pages/dashboards/PEDashboard";
import CoordinatorDashboard from "./pages/dashboards/CoordinatorDashboard";
import CoachDashboard from "./pages/dashboards/CoachDashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import EquipmentDashboard from "./pages/dashboards/EquipmentDashboard";
import ExternalTeamProposalStatus from "./pages/public/ExternalTeamProposalStatus";
import ApprovedTournaments from "./pages/tournaments/ApprovedTournaments";


// =========================================================
// TOURNAMENT PAGES
// =========================================================

import CreateTournamentProposal from "./pages/tournaments/CreateTournamentProposal";
import CoordinatorProposals from "./pages/tournaments/CoordinatorProposals";
import PETournamentApprovals from "./pages/tournaments/PETournamentApprovals";

import TournamentProposals from "./pages/coach/TournamentProposals";
import PEFacilityManagement from "./pages/pe/PEFacilityManagement";
// =========================================================
// TEAM PAGES
// =========================================================

import PETeamApprovals from "./pages/teams/PETeamApprovals";
import InternalTeamRegistration from "./pages/teams/InternalTeamRegistration";
import ExternalTeamRegistration from "./pages/teams/ExternalTeamRegistration";

// =========================================================
// PUBLIC PAGES
// =========================================================

import PublicTournamentDetails from "./pages/public/PublicTournamentDetails";

// =========================================================
// BOOKING PAGES
// =========================================================

import FacilityBooking from "./pages/bookings/FacilityBooking";
//import PEFacilityManagement from "./pages/facilities/PEFacilityManagement";

// =========================================================
// STUDENT PAGES
// =========================================================

import TeamProposalStatus from "./pages/student/TeamProposalStatus";

// =========================================================
// PROTECTED ROUTE
// =========================================================

import ProtectedRoute from "./components/ProtectedRoute";


// =========================================================
// LOGIN PAGE
// =========================================================

function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);


  // =======================================================
  // LOGIN HANDLER
  // =======================================================

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!identifier || !password) {
      setMessage(
        "Please enter username/email and password."
      );

      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await loginUser(
        identifier,
        password
      );

      console.log(
        "Login successful:",
        data
      );


      // ===================================================
      // SAVE LOGIN INFORMATION
      // ===================================================

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );


      // ===================================================
      // REDIRECT BASED ON ROLE
      // ===================================================

      switch (data.user.role) {

        case "PE":
          window.location.href = "/dashboard/pe";
          break;


        case "SPORTS_COORDINATOR":
          window.location.href =
            "/dashboard/coordinator";
          break;


        case "COACH":
          window.location.href =
            "/dashboard/coach";
          break;


        case "INTERNAL_STUDENT":
          window.location.href =
            "/dashboard/student";
          break;


        case "EQUIPMENT_MANAGER":
          window.location.href =
            "/dashboard/equipment";
          break;


        default:
          setMessage("Unknown user role.");
      }

    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      if (error.response) {

        setMessage(
          error.response.data?.detail ||
          "Invalid username/email or password."
        );

      } else {

        setMessage(
          "Unable to connect to the server. " +
          "Please make sure the backend is running."
        );
      }

    } finally {

      setLoading(false);

    }
  };


  // =======================================================
  // LOGIN UI
  // =======================================================

  return (
    <div className="login-page">

      <div className="login-card">

        {/* Header */}

        <div className="login-header">

          <h1>
            Sports Management System
          </h1>

          <p>
            Facility & Tournament Management
          </p>

        </div>


        {/* Login Form */}

        <form onSubmit={handleLogin}>

          {/* Username / Email */}

          <div className="form-group">

            <label>
              Username or Email
            </label>

            <input
              type="text"
              placeholder="Enter username or email"
              value={identifier}
              onChange={(event) =>
                setIdentifier(event.target.value)
              }
            />

          </div>


          {/* Password */}

          <div className="form-group">

            <label>
              Password
            </label>

            <div className="password-container">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>


          {/* Forgot Password */}

          <div className="forgot-password">

            <button type="button">
              Forgot Password?
            </button>

          </div>


          {/* Login Button */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>


          {/* Login Message */}

          {message && (
            <p className="login-message">
              {message}
            </p>
          )}

        </form>

      </div>

    </div>
  );
}


// =========================================================
// APPLICATION
// =========================================================

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/public/tournaments/:id"
          element={
            <PublicTournamentDetails />
          }
        />

        <Route
          path="/external-team-registration/:tournamentId"
          element={
            <ExternalTeamRegistration />
          }
        />

        <Route
          path="/external-team-status"
          element={
            <ExternalTeamProposalStatus />
          }
        />


        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/"
          element={<LoginPage />}
        />


        {/* =================================================
            PE DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard/pe"
          element={
            <ProtectedRoute allowedRole="PE">
              <PEDashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            PE - TOURNAMENT APPROVALS
        ================================================= */}

        <Route
          path="/tournaments/approvals"
          element={
            <ProtectedRoute allowedRole="PE">
              <PETournamentApprovals />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            PE - TEAM APPROVALS
        ================================================= */}

        <Route
          path="/teams/approvals"
          element={
            <ProtectedRoute allowedRole="PE">
              <PETeamApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/facilities/manage"
          element={
            <ProtectedRoute allowedRole="PE">
              <PEFacilityManagement />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            INTERNAL STUDENT - REGISTER TEAM
        ================================================= */}

        <Route
          path="/teams/register"
          element={
            <ProtectedRoute
              allowedRole="INTERNAL_STUDENT"
            >
              <InternalTeamRegistration />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            INTERNAL STUDENT - FACILITY BOOKING
        ================================================= */}

        <Route
          path="/bookings/facility"
          element={
            <ProtectedRoute
              allowedRole="INTERNAL_STUDENT"
            >
              <FacilityBooking />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            SPORTS COORDINATOR DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard/coordinator"
          element={
            <ProtectedRoute
              allowedRole="SPORTS_COORDINATOR"
            >
              <CoordinatorDashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            COORDINATOR - TOURNAMENT PROPOSALS
        ================================================= */}

        <Route
          path="/tournaments/proposals"
          element={
            <ProtectedRoute
              allowedRole="SPORTS_COORDINATOR"
            >
              <CoordinatorProposals />
            </ProtectedRoute>
          }
        />

        {/* =================================================
            COORDINATOR - APPROVED TOURNAMENTS
        ================================================= */}

        <Route
          path="/tournaments/approved"
          element={
            <ProtectedRoute
              allowedRole="SPORTS_COORDINATOR"
            >
              <ApprovedTournaments />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            COACH DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard/coach"
          element={
            <ProtectedRoute allowedRole="COACH">
              <CoachDashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            COACH - CREATE TOURNAMENT
        ================================================= */}

        <Route
          path="/tournaments/create"
          element={
            <ProtectedRoute allowedRole="COACH">
              <CreateTournamentProposal />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            COACH - MY TOURNAMENT PROPOSALS
        ================================================= */}

        <Route
          path="/tournaments/my-proposals"
          element={
            <ProtectedRoute allowedRole="COACH">
              <TournamentProposals />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            INTERNAL STUDENT DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute
              allowedRole="INTERNAL_STUDENT"
            >
              <StudentDashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            INTERNAL STUDENT
            TEAM PROPOSAL STATUS
        ================================================= */}

        <Route
          path="/student/team-proposals"
          element={
            <ProtectedRoute
              allowedRole="INTERNAL_STUDENT"
            >
              <TeamProposalStatus />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            EQUIPMENT MANAGER DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard/equipment"
          element={
            <ProtectedRoute
              allowedRole="EQUIPMENT_MANAGER"
            >
              <EquipmentDashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            UNKNOWN URL
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;