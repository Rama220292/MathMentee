import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Settings,
  MessageSquare,
  LogOut
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 🔥 active style
  const navBtn = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-medium text-white 
     ${isActive ? "bg-indigo-700" : "bg-indigo-500 hover:bg-indigo-600"} 
     transition`;

  return (
    <div className="w-full bg-white shadow-md px-6 py-3 flex justify-between items-center">

      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src="/images/MMIcon.png" className="w-8 h-8" />
        <span className="text-lg font-semibold">MathMentor</span>
      </div>

      {/* Links */}
      <div className="flex gap-2">

        <NavLink to="/questions" className={navBtn}>
          <FileText size={16} />
          Questions
        </NavLink>

        {/* Student */}
        {role === "student" && (
          <>
            <NavLink to="/dashboard" className={navBtn}>
              <LayoutDashboard size={16} />
              Dashboard
            </NavLink>

            <NavLink to="/submissions" className={navBtn}>
              <ClipboardList size={16} />
              Submissions
            </NavLink>
          </>
        )}

        {/* Teacher */}
        {role === "teacher" && (
          <>
            <NavLink to="/teacher/dashboard" className={navBtn}>
              <LayoutDashboard size={16} />
              Students
            </NavLink>

            <NavLink to="/teacher/submissions" className={navBtn}>
              <ClipboardList size={16} />
              Review
            </NavLink>
          </>
        )}

        <NavLink to="/feedback" className={navBtn}>
          <MessageSquare size={16} />
          Feedback
        </NavLink>

        <NavLink to="/settings" className={navBtn}>
          <Settings size={16} />
          Settings
        </NavLink>

      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 transition"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
}