import { useNavigate } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";

function CoachDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Coach Dashboard</h1>

      <p>Welcome to the Sports Coach Dashboard.</p>

      <LogoutButton />

      <hr />

      <h2>Coach Management</h2>

      <button
        onClick={() => navigate("/tournaments/create")}
      >
        Create Tournament Proposal
      </button>

      <ul>
        <li>View Tournament Proposals</li>
        <li>View Approved Tournaments</li>
        <li>View Match Schedules</li>
        <li>View Scores and Results</li>
      </ul>
    </div>
  );
}

export default CoachDashboard;