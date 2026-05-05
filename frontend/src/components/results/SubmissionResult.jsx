import QuestionPanel from "./QuestionPanel";
import StudentAnswerPanel from "./StudentAnswerPanel";
import ModelAnswerPanel from "./ModelAnswerPanel";
import AIScorePanel from "./AIScorePanel";
import MarkingBreakdown from "./MarkingBreakdown";
import FinalScoreSummary from "./FinalScoreSummary";

export default function SubmissionResult({ submission }) {
  return (
    <div className="space-y-6">

      <QuestionPanel question={submission.questionId} />

      <StudentAnswerPanel answer={submission.structured_answer} />

      <ModelAnswerPanel model={submission.questionId.model_answer} question={submission.questionId}/>

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