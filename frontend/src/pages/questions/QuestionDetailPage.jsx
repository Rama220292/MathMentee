import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { getQuestionById, deleteQuestion } from "../../services/questionService";
import EditQuestion from "../../components/questions/EditQuestion";
import ConfirmButton from "../../components/common/ConfirmButton";

export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 🔥 Fetch question
  const fetchQuestion = async () => {
    try {
      const data = await getQuestionById(id);
      setQuestion(data);
    } catch {
      toast.error("Failed to load question");
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  // 🔥 Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  // 🔥 Check if edited
  const isEdited =
    question?.updatedAt &&
    question.updatedAt !== question.createdAt;

  // 🔥 Delete handler
  const handleDelete = async () => {
    try {
      await deleteQuestion(id);
      toast.success("Deleted");
      navigate("/questions");
    } catch {
      toast.error("Delete failed");
    } finally {
      setConfirmOpen(false);
    }
  };

  if (!question) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/Background_2.png')" }}
      />

      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      <div className="relative z-10 bg-white p-10 rounded-2xl shadow-lg w-full max-w-2xl">

        {/* Back Button */}
        <button
          onClick={() => navigate("/questions")}
          className="mb-4 text-indigo-600 hover:underline"
        >
          ← Back to Questions
        </button>

        {/* Title */}
        <h1 className="text-2xl font-semibold mb-2">
          {question.title}
        </h1>

        {/* Question */}
        <p className="mb-3 text-gray-700">
          {question.question_text}
        </p>

        {/* Topic + Level */}
        <div className="text-sm text-gray-500 mb-3">
          {question.topic} • {question.level}
        </div>

        {/* ✅ Final Answer INLINE */}
        <div className="mb-4">
          <span className="font-medium">Final Answer: </span>
          {question.model_answer?.final_answer}
          <span className="text-gray-500 ml-2">
            ({question.final_answer_marks} marks)
          </span>
        </div>

        {/* Steps */}
        <h3 className="font-semibold mb-2">Model Answer Steps</h3>

        <ul className="space-y-2">
          {question.model_answer.steps.map((step, i) => (
            <li key={i} className="flex justify-between">
              <span>{step.content}</span>
              <span className="text-gray-500">{step.marks} marks</span>
            </li>
          ))}
        </ul>

        {/* ✅ Dates */}
        <div className="mt-4 text-xs text-gray-400">
          <div>Created: {formatDate(question.createdAt)}</div>

          {isEdited && (
            <div>Edited: {formatDate(question.updatedAt)}</div>
          )}
        </div>

        {/* ✅ Actions */}
        <div className="flex justify-end gap-2 mt-6">

          <button
            onClick={() => setEditOpen(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded"
          >
            Edit
          </button>

          <button
            onClick={() => setConfirmOpen(true)}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Delete
          </button>

        </div>

      </div>

      {/* Edit Modal */}
      {editOpen && (
        <EditQuestion
          question={question}
          close={() => setEditOpen(false)}
          refresh={fetchQuestion}
        />
      )}

      {/* Confirm Delete */}
      {confirmOpen && (
        <ConfirmButton
          message="Are you sure you want to delete this question?"
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}

    </div>
  );
}