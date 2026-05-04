import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import QuestionCard from "../../components/questions/QuestionCard";
import { getQuestions } from "../../services/questionService";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);

  const fetchQuestions = async () => {
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch {
      toast.error("Failed to load questions");
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/Background_2.png')" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl p-6">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/images/MMLogo.png" 
          className="w-32 md:w-40 lg:w-62 object-contain" />
        </div>

        <h1 className="text-3xl font-semibold text-white text-center mb-6">
          Questions Dashboard
        </h1>

        <div className="space-y-4">
          {questions.map((q) => (
            <QuestionCard
              key={q._id}
              question={q}
              refresh={fetchQuestions}
            />
          ))}
        </div>

      </div>
    </div>
  );
}