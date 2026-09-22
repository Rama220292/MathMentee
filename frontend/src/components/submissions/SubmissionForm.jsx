import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import MathContentEditor from "../math/MathContentEditor";
import HandwritingCanvas from "./HandwritingCanvas";
import { submissionErrorMessage } from "../../utils/submissionError";
import {
  confirmHandwritingUpload,
  confirmTranscript,
  createHandwritingUploadRequest,
  extractHandwriting,
  saveTranscript,
  uploadHandwritingImage
} from "../../services/submissionService";

export default function SubmissionForm({ questionId }) {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [stage, setStage] = useState("write");
  const [busyMessage, setBusyMessage] = useState("");
  const [submissionId, setSubmissionId] = useState(null);
  const [sourcePreview, setSourcePreview] = useState("");
  const [reviewNotes, setReviewNotes] = useState([]);
  const [steps, setSteps] = useState([]);
  const [finalAnswer, setFinalAnswer] = useState("");
  const [submitError, setSubmitError] = useState("");

  const processHandwriting = async () => {
    if (!canvasRef.current?.hasInk()) {
      toast.error("Write your answer before continuing");
      return;
    }

    try {
      setBusyMessage("Preparing your handwriting...");
      const file = await canvasRef.current.toFile();
      setSourcePreview(URL.createObjectURL(file));
      const uploadRequest = await createHandwritingUploadRequest({
        questionId,
        contentType: file.type,
        size: file.size
      });
      setBusyMessage("Uploading securely...");
      await uploadHandwritingImage(file, uploadRequest);
      const draft = await confirmHandwritingUpload(uploadRequest.uploadId);
      setSubmissionId(draft.submissionId);
      setBusyMessage("Reading your handwriting...");
      const extraction = await extractHandwriting(draft.submissionId);
      setSteps(extraction.extractedAnswer.steps.length
        ? extraction.extractedAnswer.steps
        : [""]);
      setFinalAnswer(extraction.extractedAnswer.final_answer || "");
      setReviewNotes(extraction.extractedAnswer.review_notes || []);
      setStage("review");
    } catch (error) {
      toast.error(error.response?.data?.err || error.message || "Could not process handwriting");
    } finally {
      setBusyMessage("");
    }
  };

  const submitConfirmedTranscript = async () => {
    setSubmitError("");
    const cleanedSteps = steps.map((step) => step.trim()).filter(Boolean);
    if (!cleanedSteps.length || !finalAnswer.trim()) {
      toast.error("Confirm at least one working step and a final answer");
      return;
    }

    let requestStage = "save";
    try {
      setBusyMessage("Saving your corrections...");
      await saveTranscript(submissionId, {
        steps: cleanedSteps,
        final_answer: finalAnswer.trim()
      });
      requestStage = "grade";
      setBusyMessage("Generating provisional feedback...");
      const submission = await confirmTranscript(submissionId);
      toast.success("Answer submitted for tutor review");
      navigate(`/submissions/${submission._id}`);
    } catch (error) {
      const message = submissionErrorMessage(error, requestStage);
      setSubmitError(message);
      toast.error(message);
    } finally {
      setBusyMessage("");
    }
  };

  if (stage === "review") {
    return (
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Check the transcription</h2>
          <p className="mt-1 text-sm text-gray-600">
            Correct anything the system misread. Only this confirmed version will be graded.
          </p>
        </div>

        {reviewNotes.length > 0 && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Please check these areas carefully:</p>
            <ul className="mt-2 list-disc pl-5">
              {reviewNotes.map((note, index) => <li key={index}>{note}</li>)}
            </ul>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold text-gray-700">Your handwriting</h3>
            <img src={sourcePreview} alt="Your handwritten answer" className="w-full rounded-xl border bg-white" />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Extracted working</h3>
            {steps.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Step {index + 1}</label>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSteps((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                      className="text-sm text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <MathContentEditor
                  label={`Working step ${index + 1}`}
                  value={step}
                  onChange={(value) => setSteps((items) => items.map((item, itemIndex) => itemIndex === index ? value : item))}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSteps((items) => [...items, ""])}
              className="rounded-lg border border-indigo-300 px-3 py-2 text-sm font-medium text-indigo-700"
            >
              + Add working step
            </button>
            <div>
              <label className="mb-2 block text-sm font-medium">Final answer</label>
              <MathContentEditor label="Final answer" value={finalAnswer} onChange={setFinalAnswer} />
            </div>
          </div>
        </div>

        {submitError && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {submitError}
          </p>
        )}
        <button
          type="button"
          disabled={Boolean(busyMessage)}
          onClick={submitConfirmedTranscript}
          className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 py-3 font-medium text-white disabled:opacity-60"
        >
          {busyMessage || "Confirm transcript and submit"}
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Write your answer</h2>
        <p className="mt-1 text-sm text-gray-600">
          Your handwriting will be transcribed, and you will review it before grading.
        </p>
      </div>
      <HandwritingCanvas ref={canvasRef} />
      <button
        type="button"
        disabled={Boolean(busyMessage)}
        onClick={processHandwriting}
        className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 py-3 font-medium text-white disabled:opacity-60"
      >
        {busyMessage || "Continue to transcription"}
      </button>
    </section>
  );
}
