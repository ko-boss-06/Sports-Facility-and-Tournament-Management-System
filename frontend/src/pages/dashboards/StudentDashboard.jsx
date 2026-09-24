import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <Layout>

      <div className="page-container">

        {/* Page Header */}
        <div className="page-header">

          <div>
            <h1>Student Dashboard</h1>

            <p>
              Access team registration, proposal status,
              facility booking and other student services.
            </p>
          </div>

        </div>


        {/* Student Services */}
        <div className="content-card">

          <h2>Student Services</h2>

          <div className="dashboard-grid">

            {/* Register Team */}
            <button
              type="button"
              className="dashboard-action-card"
              onClick={() => navigate("/teams/register")}
            >
              <h3>Register Team</h3>

              <p>
                Register your team for an approved tournament.
              </p>
            </button>


            {/* Team Proposal Status */}
            <button
              type="button"
              className="dashboard-action-card"
              onClick={() => navigate("/student/team-proposals")}
            >
              <h3>Team Proposal Status</h3>

              <p>
                Check whether your submitted team proposal
                is pending, approved or rejected.
              </p>
            </button>


            {/* Facility Booking */}
            <button
              type="button"
              className="dashboard-action-card"
              onClick={() => navigate("/bookings/facility")}
            >
              <h3>Book Sports Facility</h3>

              <p>
                View available sports facilities and
                book an available time slot.
              </p>
            </button>


            {/* My Bookings
            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>My Bookings</h3>

              <p>
                View your existing facility bookings.
              </p>
            </button> */}


            {/* Tournament Schedules */}
            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Tournament Schedules</h3>

              <p>
                View tournament schedules and match
                information.
              </p>
            </button>


            {/* Scores */}
            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Scores & Results</h3>

              <p>
                View match scores and tournament results.
              </p>
            </button>


            {/* Rewards */}
            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Rewards</h3>

              <p>
                View your sports-related rewards
                and achievements.
              </p>
            </button>

          </div>

        </div>

      </div>

    </Layout>
  );
}

export default StudentDashboard;