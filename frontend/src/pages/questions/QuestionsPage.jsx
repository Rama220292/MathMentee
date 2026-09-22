import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import QuestionCard from "../../components/questions/QuestionCard";
import { getQuestions } from "../../services/questionService";
import { getMySubmissions } from "../../services/submissionService";
import QuestionFilters from "../../components/questions/QuestionFilters";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [attemptFilter, setAttemptFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await getQuestions({ archived: showArchived });
        setQuestions(data);
      } catch {
        toast.error("Failed to load questions");
      }
    };

    fetchQuestions();
  }, [refreshVersion, showArchived]);

  useEffect(() => {
    if (user?.role !== "student") {
      return;
    }

    const fetchSubmissions = async () => {
      try {
        const data = await getMySubmissions();
        setSubmissions(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load previous attempts");
      }
    };

    fetchSubmissions();
  }, [user?.role]);

  const attemptedQuestionIds = useMemo(() => new Set(
    submissions
      .map((submission) => {
        const question = submission.questionId;
        return typeof question === "string" ? question : question?._id;
      })
      .filter(Boolean)
  ), [submissions]);

  const lastAttemptedByQuestionId = useMemo(() => {
    const attemptsByQuestion = new Map();

    submissions.forEach((submission) => {
      const question = submission.questionId;
      const questionId = typeof question === "string" ? question : question?._id;
      const attemptedAt = submission.createdAt;

      if (!questionId || !attemptedAt) return;

      const previousAttemptedAt = attemptsByQuestion.get(questionId);
      if (!previousAttemptedAt || new Date(attemptedAt) > new Date(previousAttemptedAt)) {
        attemptsByQuestion.set(questionId, attemptedAt);
      }
    });

    return attemptsByQuestion;
  }, [submissions]);

  const filteredQuestions = useMemo(() => {
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

  if (attemptFilter === "attempted") {
    result = result.filter((q) => attemptedQuestionIds.has(q._id));
  }

  if (attemptFilter === "not_attempted") {
    result = result.filter((q) => !attemptedQuestionIds.has(q._id));
  }

    return result;
  }, [search, topicFilter, levelFilter, attemptFilter, attemptedQuestionIds, questions]);

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

          {user?.role === "content_manager" && (
            <button
              onClick={() => navigate("/questions/create")}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:opacity-90"
            >
              + Create New Question
            </button>
          )}
        </div>

        {user?.role === "content_manager" && (
          <div className="mb-4 flex gap-2" role="group" aria-label="Question status">
            <button
              type="button"
              onClick={() => setShowArchived(false)}
              className={`rounded-lg px-4 py-2 font-medium ${
                !showArchived
                  ? "bg-white text-indigo-700"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Active questions
            </button>
            <button
              type="button"
              onClick={() => setShowArchived(true)}
              className={`rounded-lg px-4 py-2 font-medium ${
                showArchived
                  ? "bg-white text-indigo-700"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              Archived questions
            </button>
          </div>
        )}

        {/* ✅ 🔥 FILTERS GO HERE */}
          <QuestionFilters
            search={search}
            setSearch={setSearch}
            topicFilter={topicFilter}
            setTopicFilter={setTopicFilter}
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
            attemptFilter={attemptFilter}
            setAttemptFilter={setAttemptFilter}
            showAttemptFilter={user?.role === "student"}
            topics={topics}
            levels={levels}
          />

        <div className="space-y-4">
        {filteredQuestions.length === 0 && (
          <div className="rounded-xl bg-white p-6 text-center text-gray-600 shadow-md">
            {showArchived ? "No archived questions." : "No active questions found."}
          </div>
        )}
        {filteredQuestions.map((q) => (
          <QuestionCard
            key={q._id}
            question={q}
            hasAttempted={attemptedQuestionIds.has(q._id)}
            lastAttemptedAt={lastAttemptedByQuestionId.get(q._id)}
            refresh={() => setRefreshVersion((version) => version + 1)}
          />
          ))}
        </div>

      </div>
    </div>
  );
}
