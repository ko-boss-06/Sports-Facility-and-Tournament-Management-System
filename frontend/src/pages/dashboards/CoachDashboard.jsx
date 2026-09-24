import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

function CoachDashboard() {
  const navigate = useNavigate();

  return (
    <Layout>

      <div className="page-container">

        {/* Page Header */}
        <div className="page-header">

          <div>
            <h1>Coach Dashboard</h1>

            <p>
              Create tournament proposals, manage tournament
              activities, and monitor your submitted proposals.
            </p>
          </div>

        </div>


        {/* Coach Services */}
        <div className="content-card">

          <h2>Coach Services</h2>

          <div className="dashboard-grid">

            {/* Create Tournament */}
            <button
              type="button"
              className="dashboard-action-card"
              onClick={() => navigate("/tournaments/create")}
            >
              <h3>Create Tournament</h3>

              <p>
                Create and submit a new tournament proposal
                for review by the Sports Coordinator.
              </p>
            </button>


            {/* My Proposals */}
            <button
              type="button"
              className="dashboard-action-card"
               onClick={() => navigate("/tournaments/my-proposals")}
            >
              <h3>My Tournament Proposals</h3>

              <p>
                View the tournament proposals you have
                submitted and monitor their status.
              </p>
            </button>


            {/* Approved Tournaments */}
            <button
              type="button"
              className="dashboard-action-card"
              onClick={() => navigate("/tournaments/my-proposals")}

            >
              <h3>Approved Tournaments</h3>

              <p>
                View tournaments that have been approved
                for sports activities.
              </p>
            </button>


            {/* Tournament Schedule */}
            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Tournament Schedule</h3>

              <p>
                View schedules, venues, match dates,
                and tournament activities.
              </p>
            </button>


            {/* Team Information */}
            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Team Information</h3>

              <p>
                View participating teams and team
                information for tournaments.
              </p>
            </button>


            {/* Results */}
            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Scores & Results</h3>

              <p>
                View match scores and tournament
                results.
              </p>
            </button>

          </div>

        </div>

      </div>

    </Layout>
  );
}

export default CoachDashboard;