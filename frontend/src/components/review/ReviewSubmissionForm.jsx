import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { reviewSubmission } from "../../services/submissionService";
import { useNavigate } from "react-router-dom";

export default function ReviewSubmissionForm({ submission }) {
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      teacher_score: submission.final_score || "",
      teacher_feedback: submission.final_feedback || ""
    }
  });

  const onSubmit = async (data) => {
    try {
      const score = Number(data.teacher_score);

      if (isNaN(score)) {
        toast.error("Teacher score must be a valid number");
        return;
      }

      const payload = {
        teacher_score: score,
        teacher_feedback: data.teacher_feedback || ""
      };

      await reviewSubmission(submission._id, payload);

      toast.success("Review saved");
      navigate("/teacher/submissions");

    } catch (err) {
      console.error("BACKEND ERROR:", err.response?.data || err);
      toast.error("Failed to save review");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded-lg space-y-4"
    >
      <h2 className="text-lg font-semibold">Teacher Review</h2>

      {/* AI Score */}
      <div>
        <p className="text-sm text-gray-500">AI Score</p>
        <p className="font-medium">{submission.ai_score}</p>
      </div>

      {/* Teacher Score */}
      <div>
        <label className="block mb-1">Teacher Score</label>
        <input
          type="number"
          step="1"
          {...register("teacher_score", { required: true })}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Feedback */}
      <div>
        <label className="block mb-1">Teacher Feedback</label>
        <textarea
          {...register("teacher_feedback")}
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