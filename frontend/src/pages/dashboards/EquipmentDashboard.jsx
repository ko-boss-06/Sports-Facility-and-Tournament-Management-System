import Layout from "../../components/Layout";

function EquipmentDashboard() {
  return (
    <Layout>

      <div className="page-container">

        {/* Page Header */}
        <div className="page-header">

          <div>
            <h1>Equipment Manager Dashboard</h1>

            <p>
              Manage sports equipment, monitor inventory,
              and track equipment availability.
            </p>
          </div>

        </div>


        {/* Equipment Services */}
        <div className="content-card">

          <h2>Equipment Services</h2>

          <div className="dashboard-grid">

            {/* Equipment Inventory */}
            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Equipment Inventory</h3>

              <p>
                View and manage available sports equipment
                and inventory information.
              </p>
            </button>


            {/* Equipment Availability */}
            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Equipment Availability</h3>

              <p>
                Check equipment currently available
                for sports activities.
              </p>
            </button>


            {/* Equipment Requests */}
            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Equipment Requests</h3>

              <p>
                Review and manage requests for sports
                equipment.
              </p>
            </button>


            {/* Issued Equipment */}
            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Issued Equipment</h3>

              <p>
                View equipment currently issued to
                students, teams, or sports activities.
              </p>
            </button>


            {/* Return Equipment */}
            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Equipment Returns</h3>

              <p>
                Track returned equipment and update
                equipment availability.
              </p>
            </button>


            {/* Maintenance */}
            <button
              type="button"
              className="dashboard-action-card"
            >
              <h3>Maintenance</h3>

              <p>
                Monitor equipment requiring maintenance
                or repair.
              </p>
            </button>

          </div>

        </div>

      </div>

    </Layout>
  );
}

export default EquipmentDashboard;