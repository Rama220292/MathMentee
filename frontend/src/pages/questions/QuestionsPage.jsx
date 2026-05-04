import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import QuestionCard from "../../components/questions/QuestionCard";
import { getQuestions } from "../../services/questionService";
import QuestionFilters from "../../components/questions/QuestionFilters";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const navigate = useNavigate()

  const fetchQuestions = async () => {
    try {
      const data = await getQuestions();
      setQuestions(data);
      setFilteredQuestions(data);
    } catch {
      toast.error("Failed to load questions");
    }
  };
  useEffect(() => {
  fetchQuestions();
  }, []);
  
  useEffect(() => {
  let result = questions;

  // 🔍 Search (title, question_text, topic, level)
  if (search) {
    result = result.filter((q) =>
      [q.title, q.question_text, q.topic, q.level]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }

  // Topic filter
  if (topicFilter) {
    result = result.filter((q) => q.topic === topicFilter);
  }

  // Level filter
  if (levelFilter) {
    result = result.filter((q) => q.level === levelFilter);
  }

  setFilteredQuestions(result);
  }, [search, topicFilter, levelFilter, questions]);

  const topics = [...new Set(questions.map((q) => q.topic))];
  const levels = [...new Set(questions.map((q) => q.level))];

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

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-3xl font-semibold text-white">
            Questions Dashboard
          </h1>

          <button
            onClick={() => navigate("/questions/create")}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:opacity-90"
          >
            + Create New Question
          </button>
        </div>

        {/* ✅ 🔥 FILTERS GO HERE */}
          <QuestionFilters
            search={search}
            setSearch={setSearch}
            topicFilter={topicFilter}
            setTopicFilter={setTopicFilter}
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
            topics={topics}
            levels={levels}
          />

        <div className="space-y-4">
        {filteredQuestions.map((q) => (
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