import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function isExpired(token) {
  try {
    const decoded = jwtDecode(token);
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

const ProtectedRoute = () => {
  const token = sessionStorage.getItem("access_token");

  if (!token || isExpired(token)) {
    if (token) {
      try {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
      } catch {}
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;