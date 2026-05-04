export default function AIScorePanel({ score, feedback }) {
  return (
    <div className="bg-purple-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">AI Feedback</h3>

      <div className="text-lg font-bold">
        Score: {score}
      </div>

      <p className="mt-2 text-gray-700">{feedback}</p>
    </div>
  );
}