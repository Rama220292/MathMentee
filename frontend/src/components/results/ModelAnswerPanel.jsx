import MathText from "../math/MathText";

export default function ModelAnswerPanel({ model, question }) {
  return (
    <div className="bg-green-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Model Answer</h3>

      {model.steps.map((step, i) => (
        <div key={i} className="flex justify-between">
          <span><MathText>{step.content}</MathText></span>
          <span>{step.marks} marks</span>
        </div>
      ))}

      <div className="mt-2 font-medium flex justify-between">
        <span>Final: <MathText>{model.final_answer}</MathText></span>
        <span className="ml-2 text-gray-500">
          {question.final_answer_marks} marks
        </span>


      </div>

    </div>
  );
}
