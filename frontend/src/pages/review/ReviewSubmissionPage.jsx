import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubmissionById, getSubmissionImageUrl } from "../../services/submissionService";
import { ArrowLeft } from "lucide-react";

import SubmissionResult from "../../components/results/SubmissionResult";
import ReviewSubmissionForm from "../../components/review/ReviewSubmissionForm";

export default function ReviewSubmissionPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [sourceImageUrl, setSourceImageUrl] = useState("");
  const [status, setStatus] = useState("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getSubmissionById(id);
        setSubmission(data);
        setStatus("ready");

        if (data.has_source_image) {
          try {
            const source = await getSubmissionImageUrl(id);
            setSourceImageUrl(source.imageUrl);
          } catch {
            setSourceImageUrl("");
          }
        }
      } catch {
        setStatus("error");
      }
    };
    fetch();
  }, [id]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="rounded-lg bg-white p-6 text-gray-600 shadow">
          Loading review...
        </div>
      </div>
    );
  }

  if (status === "error" || !submission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <p className="mb-4 text-gray-700">We could not load this submission for review.</p>
          <button
            type="button"
            onClick={() => navigate("/teacher/submissions")}
            className="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
          >
            Back to Submissions
          </button>
        </div>
      </div>
    );
  }

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
        
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/teacher/submissions")}
            className="px-4 py-2 bg-white/90 text-gray-800 rounded-lg shadow hover:bg-white transition"
          >
            <ArrowLeft size={18} />
            Back to Submissions
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">

          {/* Existing content */}
          {sourceImageUrl && (
            <section className="rounded-xl border bg-gray-50 p-4">
              <h2 className="mb-3 text-lg font-semibold">Original handwriting</h2>
              <img
                src={sourceImageUrl}
                alt="Student's original handwritten answer"
                className="max-h-[36rem] w-full rounded-lg border bg-white object-contain"
              />
            </section>
          )}

          <SubmissionResult submission={submission} />

          <ReviewSubmissionForm submission={submission} />

        </div>

      </div>
    </div>
  );
}
