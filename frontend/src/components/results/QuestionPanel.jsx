import MathText from "../math/MathText";

export default function QuestionPanel({ question }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold">{question.title}</h2>
      <p className="mt-2 text-gray-700"><MathText>{question.question_text}</MathText></p>
    </div>
  );
}
