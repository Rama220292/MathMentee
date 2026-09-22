import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { getMySubmissions } from "../../services/submissionService";
import StudentSubmissionCard from "../../components/submissions/StudentSubmissionCard";


export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getMySubmissions();
        setSubmissions(Array.isArray(data) ? data : []);
        setStatus("ready");
      } catch (error) {
        setStatus("error");
        toast.error(error.response?.data?.err || "Failed to load submissions");
      }
    };
    fetch();
  }, []);

  const topics = useMemo(() => [
    ...new Set(submissions.map((submission) => submission.questionId?.topic).filter(Boolean))
  ], [submissions]);

  const levels = useMemo(() => [
    ...new Set(submissions.map((submission) => submission.questionId?.level).filter(Boolean))
  ], [submissions]);

  const filteredSubmissions = useMemo(() => {
    let result = submissions;

    if (search) {
      const normalizedSearch = search.toLowerCase();
      result = result.filter((submission) => {
        const question = submission.questionId || {};
        const displayedScore = submission.review_status === "reviewed"
          ? submission.tutor_score
          : submission.ai_score;

        return [
          question.title,
          question.topic,
          question.level,
          submission.review_status,
          displayedScore,
          submission.createdAt ? new Date(submission.createdAt).toLocaleString() : ""
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      });
    }

    if (topicFilter) {
      result = result.filter((submission) => submission.questionId?.topic === topicFilter);
    }

    if (levelFilter) {
      result = result.filter((submission) => submission.questionId?.level === levelFilter);
    }

    return result;
  }, [levelFilter, search, submissions, topicFilter]);

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

        {status === "ready" && submissions.length > 0 && (
          <div className="mb-6 rounded-xl bg-white p-4 shadow-md">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search by question, topic, level or status..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full border pl-10 pr-3 py-2 rounded-lg"
                />
              </div>

              <select
                value={topicFilter}
                onChange={(event) => setTopicFilter(event.target.value)}
                className="border px-3 py-2 rounded-lg"
              >
                <option value="">All Topics</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>

              <select
                value={levelFilter}
                onChange={(event) => setLevelFilter(event.target.value)}
                className="border px-3 py-2 rounded-lg"
              >
                <option value="">All Levels</option>
                {levels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-4">
          {status === "loading" && (
            <div className="rounded-xl bg-white p-6 text-center text-gray-600 shadow-md">
              Loading submissions...
            </div>
          )}

          {status === "error" && (
            <div className="rounded-xl bg-white p-6 text-center text-gray-600 shadow-md">
              We could not load your submissions. Please refresh the page and try again.
            </div>
          )}

          {status === "ready" && submissions.length === 0 && (
            <div className="rounded-xl bg-white p-6 text-center text-gray-600 shadow-md">
              You have not submitted any answers yet.
            </div>
          )}

          {status === "ready" && submissions.length > 0 && filteredSubmissions.length === 0 && (
            <div className="rounded-xl bg-white p-6 text-center text-gray-600 shadow-md">
              No submissions match those filters.
            </div>
          )}

          {status === "ready" && filteredSubmissions.map((s) => (
            <StudentSubmissionCard key={s._id} submission={s} />
            ))}
        </div>

      </div>
    </div>
  );
}
