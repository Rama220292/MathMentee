import { useNavigate } from "react-router-dom";

export default function StudentSubmissionCard({ submission }) {
  const navigate = useNavigate();

  const question = submission.questionId || {};
  const maxMarks = question.total_marks ?? "-";
  const displayedScore = submission.review_status === "reviewed"
    ? submission.tutor_score
    : submission.ai_score;
  const score = displayedScore ?? "-";
  const canTryAgain = Boolean(question._id);

  return (
    <div className="bg-white p-4 rounded-lg shadow">

      <h3 className="font-semibold">
        {question.title || "Question unavailable"}
      </h3>

      <p className="text-sm text-gray-500">
        Status: {submission.review_status || "unknown"}
      </p>

      <p className="text-sm text-gray-500 mt-1">
        Attempted: {new Date(submission.createdAt).toLocaleString()}
      </p>

      <p className="text-sm font-medium mt-1">
        {submission.review_status === "reviewed" ? "Tutor-reviewed" : "Provisional AI"} score:{" "}
        {score} / {maxMarks}
      </p>

      <div className="flex gap-2 mt-4">

        <button
          onClick={() => navigate(`/submissions/${submission._id}`)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          View
        </button>

        <button
          onClick={() =>
            navigate(`/submit/${question._id}`)
          }
          disabled={!canTryAgain}
          className={`px-3 py-1 rounded ${
            canTryAgain
              ? "bg-indigo-500 text-white"
              : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
        >
          Try Again
        </button>

      </div>

    </div>
  );
}
