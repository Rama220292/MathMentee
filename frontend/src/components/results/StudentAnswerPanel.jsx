import MathText from "../math/MathText";

export default function StudentAnswerPanel({ answer }) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Your Answer</h3>

      <ul className="space-y-1">
        {(answer?.steps || []).map((step, i) => (
          <li key={i}>Step {i + 1}: <MathText>{step}</MathText></li>
        ))}
      </ul>

      <div className="mt-3 font-medium">
        Final Answer: <MathText>{answer?.final_answer || ""}</MathText>
      </div>
    </div>
  );
}
