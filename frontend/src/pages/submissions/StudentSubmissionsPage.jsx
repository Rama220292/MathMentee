import { useEffect, useState } from "react";
import { getMySubmissions } from "../../services/submissionService";
import { useNavigate } from "react-router-dom";
import StudentSubmissionCard from "../../components/submissions/StudentSubmissionCard";


export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const data = await getMySubmissions();
      setSubmissions(data);
    };
    fetch();
  }, []);

return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/Background_3.png')" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl p-6">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/images/MMLogo.png"
            className="w-32 md:w-40 object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-white text-center mb-6">
          My Submissions
        </h1>

        {/* Cards */}
        <div className="space-y-4">
          {submissions.map((s) => (
            <StudentSubmissionCard key={s._id} submission={s} />
           
            ))}
        </div>

      </div>
    </div>
  );
}