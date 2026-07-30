import { Navigate, Outlet } from "react-router-dom";

export default function RoleGuard({ roles }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/questions" replace />;
  }

  return <Outlet />;
}
