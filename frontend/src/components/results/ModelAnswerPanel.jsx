export default function ModelAnswerPanel({ model }) {
  return (
    <div className="bg-green-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Model Answer</h3>

      {model.steps.map((step, i) => (
        <div key={i} className="flex justify-between">
          <span>{step.content}</span>
          <span>{step.marks} marks</span>
        </div>
      ))}

      <div className="mt-2 font-medium">
        Final: {model.final_answer}
      </div>
    </div>
  );
}