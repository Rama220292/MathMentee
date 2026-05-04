import { Navigate, Outlet } from "react-router-dom";

export default function RoleGuard({ role }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== role) {
    return <Navigate to="/questions/create" />;
  }

  return <Outlet />;
}