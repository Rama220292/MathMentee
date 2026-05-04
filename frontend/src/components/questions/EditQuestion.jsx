import QuestionsForm from "./QuestionsForm";

export default function EditQuestionModal({ question, close, refresh }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

      <div className="w-full max-w-3xl">
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