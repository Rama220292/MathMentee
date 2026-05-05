import { useNavigate } from "react-router-dom";

export default function StudentSubmissionCard({ submission }) {
  const navigate = useNavigate();

  const maxMarks =
    submission.questionId.model_answer.steps.reduce(
      (sum, step) => sum + step.marks,
      0
    ) + submission.questionId.final_answer_marks;

  return (
    <div className="bg-white p-4 rounded-lg shadow">

      <h3 className="font-semibold">
        {submission.questionId.title}
      </h3>

      <p className="text-sm text-gray-500">
        Status: {submission.review_status}
      </p>

      <p className="text-sm text-gray-500 mt-1">
        Attempted: {new Date(submission.createdAt).toLocaleString()}
      </p>

      <p className="text-sm font-medium mt-1">
        Score: {submission.final_score} / {maxMarks}
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
            navigate(`/submit/${submission.questionId._id}`)
          }
          className="px-3 py-1 bg-indigo-500 text-white rounded"
        >
          Try Again
        </button>

      </div>

    </div>
  );
}