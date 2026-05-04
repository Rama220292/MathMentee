import { useEffect, useState } from "react";
import { getSubmissions } from "../../services/submissionService";

export default function ReviewPage() {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const data = await getSubmissions();
      setSubmissions(data);
    };

    fetch();
  }, []);

  return (
    <div className="p-6 space-y-4">

      {submissions.map((s) => (
        <div key={s._id} className="bg-white p-4 rounded-lg shadow">

          <h3 className="font-semibold">{s.question.title}</h3>

          <p className="mt-2">{s.answer}</p>

          <div className="mt-3 text-green-600">
            Score: {s.score}
          </div>

          <div className="text-gray-600">
            {s.feedback}
          </div>

        </div>
      ))}

    </div>
  );
}