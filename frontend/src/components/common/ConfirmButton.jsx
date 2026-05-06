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

  // 🔥 Rounded button style
  const navBtn = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-medium 
     rounded-xl transition shadow-sm
     ${
       isActive
         ? "bg-indigo-600 text-white"
         : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
     }`;

  return (
    <div className="w-full bg-white shadow-md px-6 py-3 flex justify-between items-center">

      {/* 🔷 Logo + App Name (rounded container) */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-100 cursor-pointer hover:bg-indigo-200 transition"
      >
        <img src="/images/MMIcon.png" className="w-7 h-7 object-contain" />
        <span className="text-sm font-semibold text-indigo-700">
          MathMentor
        </span>
      </div>

      {/* 🔷 Navigation */}
      <div className="flex gap-3">

        <NavLink to="/questions" className={navBtn}>
          <FileText size={16} />
          Questions
        </NavLink>

        {/* 🎓 Student */}
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

        {/* 👨‍🏫 Teacher */}
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

      {/* 🔴 Logout (rounded + distinct color) */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-xl 
                   bg-red-100 text-red-600 hover:bg-red-200 transition shadow-sm"
      >
        <LogOut size={16} />
        Logout
      </button>

    </div>
  );
}