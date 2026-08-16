import { useState } from "react";

export default function ConfirmButton({
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  confirmType = "primary",
  className = ""
}) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);

    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-action-title"
      aria-describedby="confirm-action-message"
    >
      <div className={`w-full max-w-sm rounded-xl bg-white p-6 shadow-lg ${className}`}>
        <h2 id="confirm-action-title" className="mb-2 text-lg font-semibold">
          Confirm action
        </h2>

        <p id="confirm-action-message" className="mb-4 text-gray-600">
          {message}
        </p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
            className={`rounded px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60 ${
              confirmType === "danger"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-indigo-500 hover:bg-indigo-600"
            }`}
          >
            {isConfirming ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
