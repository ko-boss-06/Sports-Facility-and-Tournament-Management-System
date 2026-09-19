import LogoutButton from "../../components/LogoutButton";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Student Dashboard</h1>

      <p>Welcome to the Internal Student Dashboard.</p>

      <LogoutButton />

      <hr />

      <h2>Student Services</h2>

      <ul>
        <li>
          <button
            onClick={() => navigate("/teams/register")}
          >
            Register Team
          </button>
        </li>

        <li>
          <button
            onClick={() => navigate("/bookings/facility")}
          >
            Book Sports Facilities
          </button>
        </li>

        <li>
          <button
            onClick={() => navigate("/bookings/facility")}
          >
            View My Bookings
          </button>
        </li>

        <li>
          View Tournament Schedules
        </li>

        <li>
          View Scores and Results
        </li>

        <li>
          View Rewards
        </li>
      </ul>
    </div>
  );
}

export default StudentDashboard;