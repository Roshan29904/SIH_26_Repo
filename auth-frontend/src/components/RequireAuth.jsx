import { Navigate } from "react-router-dom";



 // NEED TO CHANGE WHEN REAL VERIFICATION HAPPEN USING THE BACKEND 


export default function RequireAuth({ children }) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
