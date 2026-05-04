export default function QuestionFilters({
  search,
  setSearch,
  topicFilter,
  setTopicFilter,
  levelFilter,
  setLevelFilter,
  topics,
  levels
}) {
  return (
    <div className="bg-white p-4 rounded-xl mb-6 shadow-md">

      <div className="flex flex-col md:flex-row gap-3">

        {/* Search */}
        <input
          type="text"
          placeholder="Search by title, question, topic or level..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-lg"
        />

        {/* Topic */}
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">All Topics</option>
          {topics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Level */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg"
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