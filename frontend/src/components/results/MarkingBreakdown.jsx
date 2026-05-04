export default function MarkingBreakdown({ breakdown }) {
  return (
    <div className="bg-yellow-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">Step-by-step Marking</h3>

      {breakdown.map((b, i) => (
        <div key={i} className="flex justify-between">
          <span>Step {b.step_index + 1}</span>
          <span>{b.marks_awarded} marks</span>
        </div>
      ))}
    </div>
  );
}