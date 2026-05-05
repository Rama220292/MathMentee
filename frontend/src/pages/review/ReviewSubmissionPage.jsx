import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSubmissionById } from "../../services/submissionService";

import SubmissionResult from "../../components/results/SubmissionResult";
import ReviewSubmissionForm from "../../components/review/ReviewSubmissionForm";

export default function ReviewSubmissionPage() {
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
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* Show student + AI result */}
      <SubmissionResult submission={submission} />

      {/* Teacher grading */}
      <ReviewSubmissionForm submission={submission} />

    </div>
  );
}