import { useState } from "react";
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast";
import EditQuestion from "./EditQuestion";
import {
  setQuestionArchive,
  setQuestionPublication
} from "../../services/questionService";
import ConfirmButton from "../common/ConfirmButton";

export default function QuestionCard({ question, refresh }) {
  const [open, setOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [publicationTarget, setPublicationTarget] = useState(null);
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"));

  const isArchived = Boolean(question.archived_at);

  const handleArchiveChange = async () => {
    const nextArchived = !isArchived;

    try {
      const result = await setQuestionArchive(question._id, nextArchived);
      toast.success(result.message);
      refresh();
    } catch (error) {
      toast.error(
        error.response?.data?.err ||
        `Could not ${nextArchived ? "archive" : "restore"} question`
      );
    } finally {
      setArchiveOpen(false);
    }
  };

  const handlePublicationChange = async () => {
    const nextPublished = publicationTarget;

    try {
      const result = await setQuestionPublication(question._id, nextPublished);
      toast.success(result.message);
      refresh();
    } catch (error) {
      toast.error(
        error.response?.data?.err ||
        `Could not ${nextPublished ? "publish" : "unpublish"} question`
      );
    } finally {
      setPublicationTarget(null);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-md">

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">{question.title}</h2>
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

                    {/* Content manager view */}
                    {user?.role === "content_manager" && (
                      <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/questions/${question._id}`)}
                            className="px-3 py-1 bg-gray-700 text-white rounded"
                        >
                            View
                        </button>
                        
                        {!isArchived && (
                          <>
                            <button
                              onClick={() => setOpen(true)}
                              className="px-3 py-1 bg-indigo-500 text-white rounded"
                            >
                              Edit
                            </button>

                            {question.has_unpublished_changes ? (
                              <>
                                <button
                                  onClick={() => setPublicationTarget(true)}
                                  className="px-3 py-1 text-white rounded bg-green-500 hover:bg-green-600"
                                >
                                  Publish changes
                                </button>
                                <button
                                  onClick={() => setPublicationTarget(false)}
                                  className="px-3 py-1 text-white rounded bg-amber-500 hover:bg-amber-600"
                                >
                                  Unpublish
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setPublicationTarget(!question.isPublished)}
                                className={`px-3 py-1 text-white rounded ${
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
                          className={`px-3 py-1 text-white rounded ${
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

        </div>
      </div>

      {open && (
        <EditQuestion
          question={question}
          close={() => setOpen(false)}
          refresh={refresh}
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
                className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg animate-scaleIn"
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
