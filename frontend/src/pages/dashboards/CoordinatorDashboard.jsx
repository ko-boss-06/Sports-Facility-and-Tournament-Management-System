import { useNavigate } from "react-router-dom";
import LogoutButton from "../../components/LogoutButton";

function CoordinatorDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Sports Coordinator Dashboard</h1>

      <p>
        Welcome to the Sports Coordinator Dashboard.
      </p>

      <LogoutButton />

      <hr />

      <h2>Coordinator Management</h2>

      <button
        onClick={() =>
          navigate("/tournaments/proposals")
        }
      >
        Review Tournament Proposals
      </button>

      <ul>
        <li>Forward Proposals to PE</li>
        <li>Schedule Matches</li>
        <li>Update Match Scores</li>
        <li>Manage Results</li>
        <li>Manage Rewards</li>
      </ul>
    </div>
  );
}

export default CoordinatorDashboard;