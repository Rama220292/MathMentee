export default function ModelAnswerPanel({ model, question }) {
  return (
    <div className="bg-green-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Model Answer</h3>

      {model.steps.map((step, i) => (
        <div key={i} className="flex justify-between">
          <span>{step.content}</span>
          <span>{step.marks} marks</span>
        </div>
      ))}

      <div className="mt-2 font-medium flex justify-between">
        <span> Final: {model.final_answer} </span>
        <span className="ml-2 text-gray-500">
          {question.final_answer_marks} marks
        </span>


      </div>

    </div>
  );
}