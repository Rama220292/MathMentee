import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getQuestionById,
  setQuestionArchive,
  setQuestionPublication
} from "../../services/questionService";
import EditQuestion from "../../components/questions/EditQuestion";
import ConfirmButton from "../../components/common/ConfirmButton";

export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [question, setQuestion] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [publicationTarget, setPublicationTarget] = useState(null);
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchQuestion = async () => {
      try {
        const data = await getQuestionById(id);
        if (active) setQuestion(data);
      } catch {
        if (active) toast.error("Failed to load question");
      }
    };

    fetchQuestion();

    return () => {
      active = false;
    };
  }, [id, refreshVersion]);

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const handlePublicationChange = async () => {
    const nextPublished = publicationTarget;

    try {
      const result = await setQuestionPublication(id, nextPublished);
      toast.success(result.message);
      setRefreshVersion((version) => version + 1);
    } catch (error) {
      toast.error(
        error.response?.data?.err ||
        `Could not ${nextPublished ? "publish" : "unpublish"} question`
      );
    } finally {
      setPublicationTarget(null);
    }
  };

  // Check if edited
  const isEdited =
    question?.updatedAt &&
    question.updatedAt !== question.createdAt;

  const isArchived = Boolean(question?.archived_at);

  const handleArchiveChange = async () => {
    const nextArchived = !isArchived;

    try {
      const result = await setQuestionArchive(id, nextArchived);
      toast.success(result.message);
      navigate("/questions");
    } catch (error) {
      toast.error(
        error.response?.data?.err ||
        `Could not ${nextArchived ? "archive" : "restore"} question`
      );
    } finally {
      setArchiveOpen(false);
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
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">
            {question.title}
          </h1>
          {user?.role === "content_manager" && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              isArchived
                ? "bg-gray-200 text-gray-700"
                : question.isPublished
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
              {isArchived
                ? "Archived"
                : question.has_unpublished_changes
                  ? "Published · changes pending"
                  : question.isPublished
                    ? "Published"
                    : "Unpublished"}
            </span>
          )}
        </div>

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

        {/* Dates */}
        <div className="mt-4 text-xs text-gray-400">
          <div>Created: {formatDate(question.createdAt)}</div>

          {isEdited && (
            <div>Edited: {formatDate(question.updatedAt)}</div>
          )}
        </div>

        {/*  Actions */}
        {user?.role === "content_manager" && (
          <div className="flex justify-end gap-2 mt-6">
            {!isArchived && (
              <>
                <button
                  onClick={() => setEditOpen(true)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded"
                >
                  Edit
                </button>

                {question.has_unpublished_changes ? (
                  <>
                    <button
                      onClick={() => setPublicationTarget(true)}
                      className="px-4 py-2 text-white rounded bg-green-500 hover:bg-green-600"
                    >
                      Publish changes
                    </button>
                    <button
                      onClick={() => setPublicationTarget(false)}
                      className="px-4 py-2 text-white rounded bg-amber-500 hover:bg-amber-600"
                    >
                      Unpublish
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setPublicationTarget(!question.isPublished)}
                    className={`px-4 py-2 text-white rounded ${
                      question.isPublished
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                  >
                    {question.isPublished ? "Unpublish" : "Publish"}
                  </button>
                )}
              </>
            )}

            <button
              onClick={() => setArchiveOpen(true)}
              className={`px-4 py-2 text-white rounded ${
                isArchived
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isArchived ? "Restore" : "Archive"}
            </button>
          </div>
        )}

      </div>

      {/* Edit Modal */}
      {editOpen && (
        <EditQuestion
          question={question}
          close={() => setEditOpen(false)}
          refresh={() => setRefreshVersion((version) => version + 1)}
        />
      )}

      {archiveOpen && (
        <ConfirmButton
          message={
            isArchived
              ? "Restore this question to the active question bank? It will return to its previous draft state and remain unpublished."
              : "Archive this question? It will be removed from the active question bank, but its content, versions, and submission history will be preserved."
          }
          confirmText={isArchived ? "Restore" : "Archive"}
          confirmType={isArchived ? "primary" : "danger"}
          onConfirm={handleArchiveChange}
          onCancel={() => setArchiveOpen(false)}
        />
      )}

      {publicationTarget !== null && (
        <ConfirmButton
          message={
            publicationTarget && question.has_unpublished_changes
              ? "Publish the latest saved version? New attempts will use it, while previous submissions remain tied to the version they originally used."
              : !publicationTarget
              ? "Unpublish this question? Students and tutors will no longer be able to access it."
              : "Publish this question? Students and tutors will be able to discover and practise it."
          }
          confirmText={publicationTarget && question.has_unpublished_changes
            ? "Publish changes"
            : publicationTarget ? "Publish" : "Unpublish"}
          confirmType={
            publicationTarget ? "primary" : "danger"
          }
          onConfirm={handlePublicationChange}
          onCancel={() => setPublicationTarget(null)}
        />
      )}

    </div>
  );
}
