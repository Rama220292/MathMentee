import { useNavigate } from "react-router-dom";

export default function ReviewCard({ submission }) {
  const navigate = useNavigate();

  const isReviewed = submission.review_status === "reviewed";

  const maxMarks =
    submission.questionId.model_answer.steps.reduce(
      (sum, step) => sum + step.marks,
      0
    ) + submission.questionId.final_answer_marks;

  return (
    <div className="bg-white p-4 rounded-lg shadow">

      {/* Title */}
      <h3 className="font-semibold">
        {submission.questionId.title}
      </h3>

      {/* Status */}
      <p className="text-sm text-gray-500">
        Status: {submission.review_status}
      </p>

      {/* Date */}
      <p className="text-sm text-gray-500 mt-1">
        Submitted: {new Date(submission.createdAt).toLocaleString()}
      </p>

      {/* AI Score */}
      <p className="text-sm font-medium mt-1">
        AI Score: {submission.ai_score} / {maxMarks}
      </p>

      {/* Buttons */}
      <div className="flex gap-2 mt-4">

        <button
          onClick={() => navigate(`/submissions/${submission._id}`)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          View Submission
        </button>

        <button
          onClick={() => navigate(`/submissions/${submission._id}/review`)}
          className="px-3 py-1 bg-indigo-500 text-white rounded"
        >
          {isReviewed ? "Edit Review" : "Review Submission"}
        </button>

      </div>

    </div>
  );
}