import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateSubmission } from "../../services/submissionService";
import { useNavigate } from "react-router-dom";

export default function ReviewSubmissionForm({ submission }) {
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      teacher_score: submission.final_score,
      teacher_feedback: submission.final_feedback
    }
  });

  const onSubmit = async (data) => {
    try {
      await updateSubmission(submission._id, {
        teacher_score: data.teacher_score,
        teacher_feedback: data.teacher_feedback,
        review_status: "reviewed"
      });

      toast.success("Review saved");
      navigate("/submissions");

    } catch {
      toast.error("Failed to save review");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg space-y-4">

      <h2 className="text-lg font-semibold">Teacher Review</h2>

      {/* AI score display */}
      <div>
        <p className="text-sm text-gray-500">AI Score</p>
        <p className="font-medium">{submission.ai_score}</p>
      </div>

      {/* Teacher score */}
      <div>
        <label>Teacher Score</label>
        <input
          type="number"
          {...register("teacher_score")}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Feedback */}
      <div>
        <label>Teacher Feedback</label>
        <textarea
          {...register("teacher_feedback")}
          className="w-full border p-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-indigo-500 text-white rounded"
      >
        Save Review
      </button>

    </form>
  );
}