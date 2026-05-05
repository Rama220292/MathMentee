import { Search, User, Filter } from "lucide-react";

export default function SubmissionsFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  studentFilter,
  setStudentFilter,
  levelFilter,
  setLevelFilter,
  students,
  levels
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">

      <div className="flex flex-wrap gap-3 items-center">

        {/* 🔍 Search (takes more space) */}
        <div className="relative flex-1 min-w-[200px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by name, status, level..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 border pl-10 pr-3 rounded"
            />
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="ai_graded">AI Graded</option>
          <option value="reviewed">Reviewed</option>
        </select>

        {/* Student */}
        <select
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Students</option>
          {students.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Level */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Levels</option>
          {levels.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

      </div>
    </div>
  );
}