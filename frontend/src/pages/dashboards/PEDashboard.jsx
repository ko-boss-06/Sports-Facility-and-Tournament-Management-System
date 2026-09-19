import { useNavigate } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";

function PEDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>PE Dashboard</h1>

      <p>
        Welcome to the Physical Education Head Dashboard.
      </p>

      <LogoutButton />

      <hr />

      <h2>PE Management</h2>

      <button
        onClick={() =>
          navigate("/tournaments/approvals")
        }
      >
        Tournament Approvals
      </button>
      <button
        onClick={() =>
          navigate("/teams/approvals")
        }
      >
        Team Approvals
      </button>
      <ul>
        <li>Manage Sports Facilities</li>
        <li>Approve Tournament Proposals</li>
        <li>Approve Registered Teams</li>
        <li>View Tournament Schedules</li>
        <li>View Scores and Results</li>
      </ul>
    </div>
  );
}

export default PEDashboard;