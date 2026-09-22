import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getTutors, signup } from "../../services/authService";

export default function SelectTutorPage() {
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();
  const location = useLocation();
  const signupData = location.state?.signupData;

  useEffect(() => {
    if (!signupData || signupData.role !== "student") {
      navigate("/signup", { replace: true });
      return;
    }

    const fetchTutors = async () => {
      try {
        const data = await getTutors();
        setTutors(Array.isArray(data) ? data : []);
        setStatus("ready");
      } catch {
        setStatus("error");
        toast.error("Failed to load tutors");
      }
    };

    fetchTutors();
  }, [navigate, signupData]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedTutor) {
      toast.error("Please select a tutor");
      return;
    }

    setLoading(true);

    try {
      await signup({ ...signupData, tutorId: selectedTutor });
      toast.success("Signup successful. Check your email for verification link.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.err || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-center bg-[length:110%]"
      style={{ backgroundImage: "url('/images/Background_1.png')" }}
    >
      <div className="absolute inset-0 bg-black/1.5 backdrop-blur-[0px]" />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-10 shadow-lg">
        <div className="mb-4 flex justify-center">
          <img
            src="/images/MMLogo.png"
            alt="MathMentor Logo"
            className="w-32 md:w-40 lg:w-62 object-contain"
          />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-gray-800">
            Select Your Tutor
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your tutor will be able to review your submitted answers.
          </p>
        </div>

        {status === "loading" && (
          <div className="rounded-lg bg-gray-50 p-4 text-center text-gray-600">
            Loading tutors...
          </div>
        )}

        {status === "error" && (
          <div className="rounded-lg bg-red-50 p-4 text-center text-red-700">
            Could not load tutors. Please try again later.
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <select
              value={selectedTutor}
              onChange={(event) => setSelectedTutor(event.target.value)}
              className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Select tutor</option>
              {tutors.map((tutor) => (
                <option key={tutor._id} value={tutor._id}>
                  {tutor.name} ({tutor.email})
                </option>
              ))}
            </select>

            {tutors.length === 0 && (
              <p className="text-sm text-gray-600">
                No tutors are registered yet. Please ask your tutor to create an account first.
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || tutors.length === 0}
                className={`w-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 font-medium text-white ${
                  loading || tutors.length === 0
                    ? "cursor-not-allowed opacity-70"
                    : "hover:opacity-90"
                }`}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
