import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import { loginUser } from "./api/auth";

import PEDashboard from "./pages/dashboards/PEDashboard";
import CoordinatorDashboard from "./pages/dashboards/CoordinatorDashboard";
import CoachDashboard from "./pages/dashboards/CoachDashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import EquipmentDashboard from "./pages/dashboards/EquipmentDashboard";
import CreateTournamentProposal from "./pages/tournaments/CreateTournamentProposal";
import CoordinatorProposals from "./pages/tournaments/CoordinatorProposals";
import PETournamentApprovals from "./pages/tournaments/PETournamentApprovals";
import PETeamApprovals from "./pages/teams/PETeamApprovals";
import InternalTeamRegistration from "./pages/teams/InternalTeamRegistration";
import PublicTournamentDetails from "./pages/public/PublicTournamentDetails";
import ExternalTeamRegistration from "./pages/teams/ExternalTeamRegistration";
import FacilityBooking from "./pages/bookings/FacilityBooking";

import ProtectedRoute from "./components/ProtectedRoute";

function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!identifier || !password) {
      setMessage("Please enter username/email and password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await loginUser(identifier, password);

      console.log("Login successful:", data);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect user according to their role
      switch (data.user.role) {
        case "PE":
          window.location.href = "/dashboard/pe";
          break;

        case "SPORTS_COORDINATOR":
          window.location.href = "/dashboard/coordinator";
          break;

        case "COACH":
          window.location.href = "/dashboard/coach";
          break;

        case "INTERNAL_STUDENT":
          window.location.href = "/dashboard/student";
          break;

        case "EQUIPMENT_MANAGER":
          window.location.href = "/dashboard/equipment";
          break;

        default:
          setMessage("Unknown user role.");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        setMessage(
          error.response.data?.detail ||
            "Invalid username/email or password."
        );
      } else {
        setMessage(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-header">
          <h1>Sports Management System</h1>
          <p>Facility & Tournament Management</p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Username or Email</label>

            <input
              type="text"
              placeholder="Enter username or email"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="password-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="forgot-password">
            <button type="button">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/public/tournaments/:id"
          element={<PublicTournamentDetails />}
        />
        <Route
          path="/external-team-registration/:tournamentId"
          element={<ExternalTeamRegistration />}
        />
        {/* Login */}
        <Route path="/" element={<LoginPage />} />

        {/* PE Dashboard */}
        <Route
          path="/dashboard/pe"
          element={
            <ProtectedRoute allowedRole="PE">
              <PEDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tournaments/approvals"
          element={
            <ProtectedRoute allowedRole="PE">
              <PETournamentApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/approvals"
          element={
            <ProtectedRoute allowedRole="PE">
              <PETeamApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/register"
          element={
            <ProtectedRoute allowedRole="INTERNAL_STUDENT">
              <InternalTeamRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/facility"
          element={
            <ProtectedRoute allowedRole="INTERNAL_STUDENT">
              <FacilityBooking />
            </ProtectedRoute>
          }
        />

        {/* Sports Coordinator Dashboard */}
        <Route
          path="/dashboard/coordinator"
          element={
            <ProtectedRoute allowedRole="SPORTS_COORDINATOR">
              <CoordinatorDashboard />
            </ProtectedRoute>
          }
        />
        {/* Coordinator Tournament Proposals */}
        <Route
          path="/tournaments/proposals"
          element={
            <ProtectedRoute allowedRole="SPORTS_COORDINATOR">
              <CoordinatorProposals />
            </ProtectedRoute>
          }
        />        

        {/* Coach Dashboard */}
        <Route
          path="/dashboard/coach"
          element={
            <ProtectedRoute allowedRole="COACH">
              <CoachDashboard />
            </ProtectedRoute>
          }
        />

        {/* Create Tournament Proposal */}
        <Route
          path="/tournaments/create"
          element={
            <ProtectedRoute allowedRole="COACH">
              <CreateTournamentProposal />
            </ProtectedRoute>
          }
        />

        {/* Internal Student Dashboard */}
        <Route
          path="/dashboard/student"
          element={
            <ProtectedRoute allowedRole="INTERNAL_STUDENT">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Equipment Manager Dashboard */}
        <Route
          path="/dashboard/equipment"
          element={
            <ProtectedRoute allowedRole="EQUIPMENT_MANAGER">
              <EquipmentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Unknown URL → Login */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;