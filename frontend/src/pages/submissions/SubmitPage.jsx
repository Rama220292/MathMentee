import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getQuestionById } from "../../services/questionService";
import SubmissionForm from "../../components/submissions/SubmissionForm";

export default function SubmitPage() {
  const { questionId } = useParams();
  const [question, setQuestion] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getQuestionById(questionId);
        setQuestion(data);
      } catch {
        toast.error("Failed to load question");
      }
    };

    fetch();
  }, [questionId]);

  if (!question) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/Background_2.png')" }}
      />

      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-3xl p-6">

        {/* Card */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">

          {/* Question */}
          <h1 className="text-2xl font-semibold mb-2">
            {question.title}
          </h1>

          <p className="text-gray-700 mb-4">
            {question.question_text}
          </p>

          <div className="text-sm text-gray-500 mb-6">
            {question.topic} • {question.level}
          </div>

          {/* Form */}
          <SubmissionForm questionId={questionId} />

        </div>

      </div>
    </div>
  );
}