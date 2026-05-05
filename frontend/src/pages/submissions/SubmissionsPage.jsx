import { useEffect, useState } from "react";
import { getSubmissions } from "../../services/submissionService";
import ReviewCard from "../../components/review/ReviewCard";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const data = await getSubmissions();
      setSubmissions(data);
    };
    fetch();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      {submissions.map((s) => (
        <ReviewCard key={s._id} submission={s} />
      ))}
    </div>
  );
}