export default function AIScorePanel({ score, feedback, maxScore, awaitingReview }) {
  return (
    <div className="bg-purple-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">AI Feedback</h3>

      <div className="text-lg font-bold">
        Score: {score}{Number.isFinite(maxScore) ? ` / ${maxScore}` : ""}
      </div>

      <p className="mt-2 text-gray-700">{feedback}</p>

      {awaitingReview && (
        <p className="mt-3 text-sm text-purple-700">
          This is automated feedback and may be updated after tutor review.
        </p>
      )}
    </div>
  );
}
