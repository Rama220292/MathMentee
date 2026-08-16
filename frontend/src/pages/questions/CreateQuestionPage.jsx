import { useState } from "react";
import { useNavigate } from "react-router-dom";

import QuestionImageForm from "../../components/questions/QuestionImageForm";
import QuestionsForm from "../../components/questions/QuestionsForm";

export default function CreateQuestionPage() {
  const navigate = useNavigate();
  const [inputMethod, setInputMethod] = useState(null);
  const [validatedImage, setValidatedImage] = useState(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const startAnotherQuestion = () => {
    setShowSaveSuccess(false);
    setValidatedImage(null);
    setInputMethod(null);
  };

  const saveSuccessDialog = showSaveSuccess ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="question-save-success-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
        <h2
          id="question-save-success-title"
          className="text-2xl font-semibold text-gray-800"
        >
          Question saved successfully
        </h2>
        <p className="mt-3 text-gray-600">
          Your question has been saved to the database successfully.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={startAnotherQuestion}
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3 font-medium text-white"
          >
            Submit another question
          </button>
          <button
            type="button"
            onClick={() => navigate("/questions")}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-100"
          >
            Return to questions
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (inputMethod === "manual") {
    return (
      <div className="bg-gray-100 min-h-screen">
        <QuestionsForm onCancel={() => setInputMethod(null)} />
      </div>
    );
  }

  if (validatedImage) {
    const extracted = validatedImage.extraction.extractedContent;
    return (
      <div className="bg-gray-100 min-h-screen">
        <QuestionsForm
          initialData={{ _id: validatedImage.draft.draftId, ...extracted }}
          onCancel={() => setValidatedImage(null)}
          onSuccess={() => setShowSaveSuccess(true)}
          submitLabel="Submit Question"
        />
        {saveSuccessDialog}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/Background_2.png')" }}
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {inputMethod === "photo" ? (
        <QuestionImageForm
          onBack={() => {
            setValidatedImage(null);
            setInputMethod(null);
          }}
          onValidated={setValidatedImage}
        />
      ) : (
        <section className="relative z-10 bg-white p-6 md:p-10 rounded-2xl shadow-lg w-full max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-800">
              Create a question
            </h1>
            <p className="text-gray-600 mt-2">
              Choose how you want to add the question content.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setInputMethod("manual")}
              className="text-left border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-400 hover:bg-indigo-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span className="block text-3xl" aria-hidden="true">⌨️</span>
              <span className="block text-xl font-semibold text-gray-800 mt-4">
                Key in manually
              </span>
              <span className="block text-sm text-gray-600 mt-2">
                Enter the question, model answer, working steps, and marks yourself.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setInputMethod("photo")}
              className="text-left border-2 border-gray-200 rounded-xl p-6 hover:border-indigo-400 hover:bg-indigo-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <span className="block text-3xl" aria-hidden="true">📷</span>
              <span className="block text-xl font-semibold text-gray-800 mt-4">
                Take or select a picture
              </span>
              <span className="block text-sm text-gray-600 mt-2">
                Start from a photo, then review the extracted content.
              </span>
            </button>
          </div>
        </section>
      )}

      {validatedImage && (
        <p className="sr-only" aria-live="polite">
          Question photo confirmed and attached to draft {validatedImage.draft.draftId}.
        </p>
      )}
    </div>
  );
}
