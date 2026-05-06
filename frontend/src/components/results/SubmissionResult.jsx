import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import QuestionPanel from "./QuestionPanel";
import StudentAnswerPanel from "./StudentAnswerPanel";
import ModelAnswerPanel from "./ModelAnswerPanel";
import AIScorePanel from "./AIScorePanel";
import MarkingBreakdown from "./MarkingBreakdown";
import FinalScoreSummary from "./FinalScoreSummary";

export default function SubmissionResult({ submission }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">

      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate("/questions")}
          className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
          Back to Questions
        </button>
      </div>

      <QuestionPanel question={submission.questionId} />

      <StudentAnswerPanel answer={submission.structured_answer} />

      <ModelAnswerPanel
        model={submission.questionId.model_answer}
        question={submission.questionId}
      />

      <AIScorePanel
        score={submission.ai_score}
        feedback={submission.ai_feedback}
      />

      {submission.review_status === "reviewed" && (
        <>
          <MarkingBreakdown breakdown={submission.marks_breakdown} />

          <FinalScoreSummary
            score={submission.final_score}
            feedback={submission.final_feedback}
          />
        </>
      )}

    </div>
  );
}