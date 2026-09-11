import { Navigate } from "react-router-dom";
import { getStoredAccessToken } from "../services/api";

export default function RequireAuth({ children }) {
  const token = getStoredAccessToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
