import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getSubmissionById } from "../../services/submissionService";

import SubmissionResult from "../../components/results/SubmissionResult";


export default function SubmissionResultPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getSubmissionById(id);
        setSubmission(data);
      } catch (requestError) {
        const message = requestError.response?.data?.err || "Could not load submission";
        setError(message);
        toast.error(message);
      }
    };
    fetch();
  }, [id]);

  if (error) return <p className="mt-10 text-center text-red-600">{error}</p>;
  if (!submission) return <p className="mt-10 text-center">Loading...</p>;

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
      <div className="relative z-10 w-full max-w-4xl p-6">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/images/MMLogo.png"
            className="w-32 md:w-40 object-contain"
          />
        </div>

        <h1 className="text-white text-2xl text-center mb-4">
          Submission Result
        </h1>

        {/* Result Card */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">

          <SubmissionResult submission={submission} />

        </div>

      </div>
    </div>
  );
}
