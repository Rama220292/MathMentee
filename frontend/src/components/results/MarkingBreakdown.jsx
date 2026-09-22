export default function MarkingBreakdown({ breakdown }) {
  return (
    <div className="bg-yellow-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-2">AI marks breakdown</h3>

      {breakdown.map((b, i) => (
        <div key={i} className="border-t border-yellow-200 py-2 first:border-0">
          <div className="flex justify-between gap-4">
            <span>{b.criterion || `Criterion ${i + 1}`}</span>
            <span>{b.marks_awarded} / {b.marks_available}</span>
          </div>
          {b.evidence && <p className="mt-1 text-sm text-gray-600">Evidence: {b.evidence}</p>}
          {b.feedback && <p className="text-sm text-gray-600">{b.feedback}</p>}
        </div>
      ))}
    </div>
  );
}
