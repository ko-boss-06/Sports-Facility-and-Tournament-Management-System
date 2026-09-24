import { useNavigate } from "react-router-dom";
import LogoutButton from "./LogoutButton";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  const goDashboard = () => {
    switch (role) {
      case "PE":
        navigate("/dashboard/pe");
        break;

      case "SPORTS_COORDINATOR":
        navigate("/dashboard/coordinator");
        break;

      case "COACH":
        navigate("/dashboard/coach");
        break;

      case "INTERNAL_STUDENT":
        navigate("/dashboard/student");
        break;

      case "EQUIPMENT_MANAGER":
        navigate("/dashboard/equipment");
        break;

      default:
        navigate("/");
    }
  };

  return (
    <nav className="app-navbar">
      <div
        className="navbar-brand"
        onClick={goDashboard}
      >
        <div className="navbar-logo">
          SMS
        </div>

        <div className="navbar-brand-text">
          <div className="navbar-title">
            Sports Management System
          </div>

          <div className="navbar-subtitle">
            Sports & Facility Management
          </div>
        </div>
      </div>

      <div className="navbar-right">

        {role && (
          <div className="navbar-role">
            {role.replaceAll("_", " ")}
          </div>
        )}

        <button
          type="button"
          className="navbar-dashboard-button"
          onClick={goDashboard}
        >
          Dashboard
        </button>

        <LogoutButton />

      </div>
    </nav>
  );
}

export default Navbar;