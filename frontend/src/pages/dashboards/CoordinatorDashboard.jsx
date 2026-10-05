import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

function CoordinatorDashboard() {
  const navigate = useNavigate();

  return (
    <Layout>

      <div className="page-container">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="page-header">

          <div>
            <h1>Sports Coordinator Dashboard</h1>

            <p>
              Review tournament proposals, monitor approved
              tournaments, and manage sports coordination activities.
            </p>
          </div>

        </div>


        {/* =================================================
            COORDINATOR SERVICES
        ================================================= */}

        <div className="content-card">

          <h2>Coordinator Services</h2>

          <div className="dashboard-grid">

            {/* =================================================
                TOURNAMENT PROPOSALS
            ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
              onClick={() =>
                navigate("/tournaments/proposals")
              }
            >
              <h3>Tournament Proposals</h3>

              <p>
                Review tournament proposals submitted by
                coaches and monitor their approval status.
              </p>
            </button>


            {/* =================================================
                APPROVED TOURNAMENTS
            ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
              onClick={() =>
                navigate("/tournaments/approved")
              }
            >
              <h3>Approved Tournaments</h3>

              <p>
                View tournaments that have been approved
                for sports activities.
              </p>
            </button>


            {/* =================================================
                TOURNAMENT MANAGEMENT
            ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
              onClick={() =>
                navigate("/tournaments/manage")
              }
            >
              <h3>Tournament Management</h3>

              <p>
                Manage approved tournaments and update
                tournament information.
              </p>
            </button>


            {/* =================================================
                TOURNAMENT SCHEDULE
            ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Tournament Schedule</h3>

              <p>
                View and monitor tournament schedules,
                dates, venues, and match activities.
              </p>
            </button>


            {/* =================================================
                SPORTS ACTIVITIES
            ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Sports Activities</h3>

              <p>
                Monitor ongoing and upcoming sports
                activities managed by the institution.
              </p>
            </button>


            {/* =================================================
                REGISTERED TEAMS
            ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Registered Teams</h3>

              <p>
                View teams registered for approved
                tournaments and sports events.
              </p>
            </button>


            {/* =================================================
                SPORTS REPORTS
            ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Sports Reports</h3>

              <p>
                View sports activity information and
                administrative reports.
              </p>
            </button>

          </div>

        </div>

      </div>

    </Layout>
  );
}

export default CoordinatorDashboard;