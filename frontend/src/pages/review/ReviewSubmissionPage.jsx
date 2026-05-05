import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSubmissionById } from "../../services/submissionService";

import SubmissionResult from "../../components/results/SubmissionResult";
import ReviewSubmissionForm from "../../components/review/ReviewSubmissionForm";

export default function ReviewSubmissionPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const data = await getSubmissionById(id);
      setSubmission(data);
    };
    fetch();
  }, [id]);

  if (!submission) return <p>Loading...</p>;

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

        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-white text-center mb-6">
          Review Submission
        </h1>

        {/* Main Content Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">

          {/* Existing content */}
          <SubmissionResult submission={submission} />

          <ReviewSubmissionForm submission={submission} />

        </div>

      </div>
    </div>
  );
}