import { useState } from "react";
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast";
import EditQuestion from "./EditQuestion";
import { deleteQuestion } from "../../services/questionService";
import ConfirmButton from "../common/ConfirmButton";

export default function QuestionCard({ question, refresh }) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"));

  const handleDelete = async () => {
    const handleDelete = async () => {
        try {
            await deleteQuestion(question._id);
            toast.success("Deleted");
            refresh();
        } catch {
            toast.error("Delete failed");
        } finally {
            setConfirmOpen(false);
        }
        };

    try {
      await deleteQuestion(question._id);
      toast.success("Deleted");
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-md">

      <h2 className="text-lg font-semibold">{question.title}</h2>

      <p className="text-gray-600 mt-1">
        {question.question_text}
      </p>

      <div className="flex justify-between items-center mt-4">

        <div className="text-sm text-gray-500">
          {question.topic} • {question.level} • {question.total_marks} Marks
        </div>

        <div className="flex gap-2">


                <div className="flex justify-between items-center mt-4">
                    {/* Student view */}
                    {user?.role === "student" && (
                      <button
                        onClick={() => navigate(`/submit/${question._id}`)}
                        className="px-3 py-1 bg-green-500 text-white rounded"
                      >
                        Attempt Question
                      </button>
                    )}

                    {/* Teacher view */}
                    {user?.role === "teacher" && (
                      <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/questions/${question._id}`)}
                            className="px-3 py-1 bg-gray-700 text-white rounded"
                        >
                            View
                        </button>
                        
                        <button
                          onClick={() => setOpen(true)}
                          className="px-3 py-1 bg-indigo-500 text-white rounded"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => setConfirmOpen(true)}
                          className="px-3 py-1 bg-red-500 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                </div>

        </div>
      </div>

      {open && (
        <EditQuestion
          question={question}
          close={() => setOpen(false)}
          refresh={refresh}
        />
      )}

        {confirmOpen && (
            <ConfirmButton
                message="Are you sure you want to delete this question?"
                confirmText="Delete"
                confirmType="danger"
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
                className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg animate-scaleIn"
            />
        )}

    </div>
  );
}