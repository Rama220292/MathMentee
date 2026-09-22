import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { reviewSubmission } from "../../services/submissionService";
import { useNavigate } from "react-router-dom";
import MathText from "../math/MathText";
import { buildReviewRows, marksMatch, totalAwarded } from "../../utils/reviewMarks";

export default function ReviewSubmissionForm({ submission }) {
  const navigate = useNavigate();
  const maxMarks = submission.questionId?.total_marks;
  const initialBreakdown = useMemo(() => buildReviewRows(submission), [submission]);
  const [reviewRows, setReviewRows] = useState(initialBreakdown);
  const initialTutorScore = initialBreakdown.length
    ? totalAwarded(initialBreakdown)
    : submission.ai_score ?? "";

  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      tutor_score: submission.tutor_score ?? initialTutorScore,
      tutor_feedback: submission.tutor_feedback || ""
    }
  });

  const updateRow = (index, updates) => {
    setReviewRows((rows) => {
      const nextRows = rows.map((row, rowIndex) => (
        rowIndex === index ? { ...row, ...updates } : row
      ));
      setValue("tutor_score", totalAwarded(nextRows), { shouldDirty: true });
      return nextRows;
    });
  };

  const onSubmit = async (data) => {
    try {
      const score = Number(data.tutor_score);

      if (isNaN(score)) {
        toast.error("Tutor score must be a valid number");
        return;
      }

      if (Number.isFinite(maxMarks) && score > maxMarks) {
        toast.error(`Tutor score cannot exceed ${maxMarks}`);
        return;
      }

      const normalizedRows = reviewRows.map((row) => ({
        criterion: row.criterion,
        marks_awarded: Number(row.marks_awarded),
        marks_available: Number(row.marks_available),
        evidence: row.evidence || "",
        feedback: row.feedback || ""
      }));
      const invalidRow = normalizedRows.find((row) => (
        !Number.isFinite(row.marks_awarded)
        || row.marks_awarded < 0
        || row.marks_awarded > row.marks_available
      ));
      if (invalidRow) {
        toast.error("Each reviewed mark must be between 0 and the available marks");
        return;
      }
      if (normalizedRows.length && !marksMatch(totalAwarded(normalizedRows), score)) {
        toast.error("Final tutor score must equal the reviewed marks total");
        return;
      }

      const payload = {
        tutor_score: score,
        tutor_feedback: data.tutor_feedback || ""
      };
      if (normalizedRows.length) {
        payload.tutor_marks_breakdown = normalizedRows;
      }

      await reviewSubmission(submission._id, payload);

      toast.success("Review saved");
      navigate("/teacher/submissions");

    } catch (err) {
      console.error("BACKEND ERROR:", err.response?.data || err);
      toast.error(err.response?.data?.err || "Failed to save review");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded-lg space-y-4"
    >
      <h2 className="text-lg font-semibold">Tutor Review</h2>

      {/* AI Score */}
      <div>
        <p className="text-sm text-gray-500">AI Score</p>
        <p className="font-medium">
          {submission.ai_score ?? "-"}
          {Number.isFinite(maxMarks) ? ` / ${maxMarks}` : ""}
        </p>
      </div>

      {reviewRows.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Reviewed marks</h3>

          {reviewRows.map((row, index) => (
            <div key={`${row.criterion}-${index}`} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{row.label}</p>
                  {row.modelContent && (
                    <p className="mt-1 text-sm text-gray-600">
                      <MathText>{row.modelContent}</MathText>
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Available: {row.marks_available}
                </p>
              </div>

              {row.evidence && (
                <p className="mb-3 text-sm text-gray-600">
                  AI evidence: {row.evidence}
                </p>
              )}

              <div className="grid gap-3 md:grid-cols-[10rem_1fr]">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Marks awarded
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={row.marks_available}
                    value={row.marks_awarded}
                    onChange={(event) => updateRow(index, {
                      marks_awarded: event.target.value
                    })}
                    className="w-full rounded border p-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Notes for this mark
                  </label>
                  <textarea
                    value={row.feedback}
                    onChange={(event) => updateRow(index, {
                      feedback: event.target.value
                    })}
                    className="min-h-20 w-full rounded border p-2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tutor Score */}
      <div>
        <label className="block mb-1">Final Tutor Score</label>
        <input
          type="number"
          step="0.5"
          max={maxMarks}
          {...register("tutor_score", { required: true })}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Feedback */}
      <div>
        <label className="block mb-1">Tutor Feedback</label>
        <textarea
          {...register("tutor_feedback")}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">

        {/* Cancel */}
        <button
          type="button"
          onClick={() => navigate("/teacher/submissions")}
          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        {/* Submit */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded hover:opacity-90 transition"
        >
          Save Review
        </button>

      </div>
    </form>
  );
}
