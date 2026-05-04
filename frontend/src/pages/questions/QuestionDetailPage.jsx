import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getQuestionById } from "../../services/questionService";

export default function QuestionDetailPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getQuestionById(id);
        setQuestion(data);
      } catch {
        toast.error("Failed to load question");
      }
    };

    fetch();
  }, [id]);

  if (!question) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/Background_2.png')" }}
      />

      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      <div className="relative z-10 bg-white p-10 rounded-2xl shadow-lg w-full max-w-2xl">

        <h1 className="text-2xl font-semibold mb-4">
          {question.title}
        </h1>

        <p className="mb-4">{question.question_text}</p>

        <div className="mb-4 text-sm text-gray-500">
          {question.topic} • {question.level}
        </div>

        <h3 className="font-semibold mb-2">Model Answer</h3>

        <ul className="space-y-2">
          {question.model_answer.steps.map((step, i) => (
            <li key={i} className="flex justify-between">
              <span>{step.content}</span>
              <span>{step.marks} marks</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 font-semibold">
          Final Answer: {question.model_answer.final_answer}
        </div>

        <div className="mt-2">
          Final Marks: {question.final_answer_marks}
        </div>

        <div className="mb-4">
            <button
            onClick={() => navigate("/questions")}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
            ← Back to Questions
            </button>
        </div>

      </div>

    </div>
  );
}