import QuestionsForm from "./QuestionsForm";

export default function EditQuestionModal({ question, close, refresh }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Edit ${question.title}`}
    >

      <div className="w-full max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto overscroll-contain rounded-2xl sm:max-h-[calc(100vh-3rem)]">
        <QuestionsForm
            initialData={question}
            onSuccess={() => {
            refresh();
            close();}}
            onCancel={close}
        />
      </div>

    </div>
  );
}
