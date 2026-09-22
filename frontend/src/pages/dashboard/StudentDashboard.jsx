import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow text-center max-w-md">
        <h1 className="text-2xl font-semibold mb-4">My Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Keep practising questions and review your completed attempts.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate("/questions")}
            className="rounded bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-600"
          >
            Practise Questions
          </button>
          <button
            type="button"
            onClick={() => navigate("/submissions")}
            className="rounded bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300"
          >
            My Submissions
          </button>
        </div>
      </div>
    </div>
  );
}
