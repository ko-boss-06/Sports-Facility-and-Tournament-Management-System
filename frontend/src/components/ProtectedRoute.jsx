import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("access_token");
  const userData = localStorage.getItem("user");

  // User is not logged in
  if (!token || !userData) {
    return <Navigate to="/" replace />;
  }

  let user;

  try {
    user = JSON.parse(userData);
  } catch {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    return <Navigate to="/" replace />;
  }

  // User's role is not allowed
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has permission
  return children;
}

export default ProtectedRoute;