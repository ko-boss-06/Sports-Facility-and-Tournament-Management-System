import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";

function PEDashboard() {
  const navigate = useNavigate();

  return (
    <Layout>

      <div className="page-container">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="page-header">

          <div>

            <h1>PE Dashboard</h1>

            <p>
              Manage tournament approvals, team registrations,
              sports facilities, and sports administration
              activities.
            </p>

          </div>

        </div>


        {/* =================================================
            PE SERVICES
        ================================================= */}

        <div className="content-card">

          <h2>PE Services</h2>


          <div className="dashboard-grid">

            {/* =================================================
                TOURNAMENT APPROVALS
            ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
              onClick={() =>
                navigate("/tournaments/approvals")
              }
            >

              <h3>
                Tournament Approvals
              </h3>

              <p>
                Review and approve tournament proposals
                submitted by coaches.
              </p>

            </button>


            {/* =================================================
                TEAM APPROVALS
            ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
              onClick={() =>
                navigate("/teams/approvals")
              }
            >

              <h3>
                Team Approvals
              </h3>

              <p>
                Review submitted team registrations and
                approve or reject proposals.
              </p>

            </button>


            {/* =================================================
                TOURNAMENT MANAGEMENT
            ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
            >

              <h3>
                Tournament Management
              </h3>

              <p>
                Manage approved tournaments and related
                sports activities.
              </p>

            </button>


            {/* =================================================
                TEAM MANAGEMENT
            ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
            >

              <h3>
                Team Management
              </h3>

              <p>
                View and manage registered sports teams.
              </p>

            </button>


            {/* =================================================
                FACILITY MANAGEMENT
            ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
              onClick={() =>
                navigate("/facilities/manage")
              }
            >

              <h3>
                Facility Management
              </h3>

              <p>
                Add, update, deactivate and manage
                sports facilities.
              </p>

            </button>


            {/* =================================================
                SPORTS ACTIVITIES
            ================================================= */}

            <button
              type="button"
              className="dashboard-action-card"
            >

              <h3>
                Sports Activities
              </h3>

              <p>
                Monitor sports events and related
                activities.
              </p>

            </button>

          </div>

        </div>

      </div>

    </Layout>
  );
}

export default PEDashboard;