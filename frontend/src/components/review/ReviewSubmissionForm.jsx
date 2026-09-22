import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { reviewSubmission } from "../../services/submissionService";
import { useNavigate } from "react-router-dom";

export default function ReviewSubmissionForm({ submission }) {
  const navigate = useNavigate();
  const maxMarks = submission.questionId?.total_marks;

  const { register, handleSubmit } = useForm({
    defaultValues: {
      tutor_score: submission.tutor_score ?? submission.ai_score ?? "",
      tutor_feedback: submission.tutor_feedback || ""
    }
  });

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

      const payload = {
        tutor_score: score,
        tutor_feedback: data.tutor_feedback || ""
      };

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

      {/* Tutor Score */}
      <div>
        <label className="block mb-1">Tutor Score</label>
        <input
          type="number"
          step="1"
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
