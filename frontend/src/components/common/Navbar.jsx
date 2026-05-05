import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="w-full bg-white shadow-md px-6 py-3 flex justify-between items-center">

      {/* Left: Logo / App name */}
      <div
        className="text-lg font-semibold cursor-pointer"
        onClick={() => navigate("/questions")}
      >
        MathMentor
      </div>

      {/* Middle: Links */}
      <div className="flex gap-4 items-center">

        <Link to="/questions" className="hover:text-indigo-500">
          Questions
        </Link>

        {/* 🎓 Student links */}
        {role === "student" && (
          <Link to="/submissions" className="hover:text-indigo-500">
            My Submissions
          </Link>
        )}

        {/* 👨‍🏫 Teacher links */}
        {role === "teacher" && (
          <>
            <Link to="/teacher/submissions" className="hover:text-indigo-500">
              Review
            </Link>

            <Link to="/questions/create" className="hover:text-indigo-500">
              Create
            </Link>
          </>
        )}

      </div>

      {/* Right: Logout */}
      <button
        onClick={handleLogout}
        className="px-3 py-1 bg-indigo-500 text-white rounded"
      >
        Logout
      </button>

    </div>
  );
}