import { useEffect, useState } from "react";
import { getSubmissions } from "../../services/submissionService";
import ReviewCard from "../../components/review/ReviewCard";
import SubmissionsFilters from "../../components/submissions/SubmissionsFilters";


export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const data = await getSubmissions();
      setSubmissions(data);
    };
    fetch();
  }, []);

  const students = [
    ...new Set(submissions.map((s) => s.studentId?.name))
  ];

  const levels = [
    ...new Set(submissions.map((s) => s.questionId?.level))
  ];

  useEffect(() => {
    let result = submissions;

    // 🔍 Search
    if (search) {
      result = result.filter((s) =>
        [
          s.studentId?.name,
          s.review_status,
          s.questionId?.level
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter((s) => s.review_status === statusFilter);
    }

    // Student filter
    if (studentFilter) {
      result = result.filter(
        (s) => s.studentId?.name === studentFilter
      );
    }

    // Level filter
    if (levelFilter) {
      result = result.filter(
        (s) => s.questionId?.level === levelFilter
      );
    }

    setFiltered(result);

  }, [search, statusFilter, studentFilter, levelFilter, submissions]);

return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/Background_3.png')" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl p-6">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/images/MMLogo.png"
            className="w-32 md:w-40 object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-white text-center mb-6">
          Submissions Dashboard
        </h1>
        
        {/* Filter */}
        <SubmissionsFilters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          studentFilter={studentFilter}
          setStudentFilter={setStudentFilter}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          students={students}
          levels={levels}
        />
        {/* Cards */}
        <div className="space-y-4">
          {filtered.map((s) => (
            <ReviewCard key={s._id} submission={s} />
          ))}
        </div>

      </div>
    </div>
  );
}