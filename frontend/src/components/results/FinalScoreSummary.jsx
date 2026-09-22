export default function FinalScoreSummary({ score, feedback }) {
  return (
    <div className="bg-indigo-50 p-4 rounded-lg text-center">
      <h2 className="text-xl font-bold">
        Tutor-reviewed score: {score}
      </h2>

      <p className="mt-2">{feedback}</p>
    </div>
  );
}
