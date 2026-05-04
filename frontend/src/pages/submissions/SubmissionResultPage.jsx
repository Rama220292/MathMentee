import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSubmissionById } from "../../services/submissionService";

import QuestionPanel from "../../components/results/QuestionPanel";
import StudentAnswerPanel from "../../components/results/StudentAnswerPanel";
import ModelAnswerPanel from "../../components/results/ModelAnswerPanel";
import AIScorePanel from "../../components/results/AIScorePanel";
import MarkingBreakdown from "../../components/results/MarkingBreakdown";
import FinalScoreSummary from "../../components/results/FinalScoreSummary";
import SubmissionResult from "../../components/results/SubmissionResult";


export default function SubmissionResultPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const data = await getSubmissionById(id);
      setSubmission(data);
    };
    fetch();
  }, [id]);

  if (!submission) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">

      <SubmissionResult submission={submission} />

    </div>
  );
}