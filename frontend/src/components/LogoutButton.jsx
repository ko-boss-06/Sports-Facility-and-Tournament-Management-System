import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the logged-in user's session
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    // Go back to login page
    navigate("/", { replace: true });
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default LogoutButton;