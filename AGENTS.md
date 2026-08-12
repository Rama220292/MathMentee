# MathMentee Agent Guide

## Project purpose

MathMentee is a Singapore secondary-school mathematics practice platform.
Students answer published questions and receive deterministic marking plus
AI-generated feedback. Teachers manage questions and review submissions.

## Current priorities

The immediate product priority is an end-to-end question-authoring and practice
workflow for content managers. Content managers should be able to create
questions from images or free-form writing, confirm and edit the resulting
question content, and publish those questions for students to practise.

Implement this incrementally, starting with pictures. Free-form writing is a
later increment and should not delay delivery of the image workflow.

For the first image-based increment, prioritise this complete path:

1. An authorised content manager takes a photo or selects an existing question
   image. (Done)
2. The frontend form performs basic client-side checks, including supported file
   type and maximum size, and displays an image preview.(Done)
3. The frontend asks the backend for a short-lived, single-purpose upload URL.(Done)
4. The frontend uses that URL to upload the image directly to a private S3
    bucket. Private source assets must not be exposed through public or
    student-facing APIs. (Done)
5. The frontend tells the backend that the upload completed. After validating
    the upload, the backend creates or updates the question draft with the S3
    object key rather than a public image URL. (Done)
6. The backend starts extraction with a server-side provider such as OpenAI or
   Mathpix. Provider API keys and other secrets must remain on the server.
7. Extraction returns editable question text and mathematical content together
   with processing status and confidence information. Treat all extracted
   content as untrusted draft data, not as an authoritative question, model
   answer, or marking scheme.
8. The content manager reviews and corrects the extracted question content, then
   manually completes or reviews the model answer and mark allocation.
9. The content manager previews the completed question and explicitly publishes
   it through the existing question lifecycle to the shared question bank.
10. Students can discover the published question, submit an answer, and complete
    the existing marking and review flow without gaining access to source
    images, model answers, marking allocations, or authoring metadata.

Keep this work end to end: align storage and data models, backend APIs and
authorization, frontend upload and confirmation screens, student-facing
question rendering, validation, error states, and automated tests. Prefer a
small working image flow over partially implementing image upload, handwriting,
and other future input formats in parallel.

## Repository layout

- `frontend/` — React + Vite client application.
- `backend/` — Node.js + Express API with MongoDB/Mongoose.
- `docs/` — product, API, database, grading, and permissions decisions.
- `netlify.toml` — frontend deployment configuration.
- `render.yaml` — backend deployment configuration.

## Working conventions

- Keep frontend and backend changes aligned when an API contract changes.
- Reuse the established structure:
  - backend: routes → controllers → services/models/validators
  - frontend: pages → components → services
- Use Joi for backend request validation.
- Use React Hook Form and Zod for frontend form validation.
- Keep authentication and authorization checks server-side.
- Do not expose server secrets, especially `OPENAI_API_KEY`, in frontend code
  or `VITE_*` environment variables.
- Do not modify deployment configuration unless the task requires it.

## Backend

- Start the API: `cd backend && npm start`
- Development mode: `cd backend && npm run dev`
- Health endpoint: `GET /health`
- Preserve the teacher-review workflow: a teacher's reviewed score and feedback
  are the final authoritative values for that submission.
- The deterministic matcher is intentionally limited; do not claim or implement
  general symbolic equivalence without an explicit task.

## Frontend

- Start development server: `cd frontend && npm run dev`
- Lint: `cd frontend && npm run lint`
- Production build: `cd frontend && npm run build`
- API base URL comes from `VITE_BACK_END_SERVER_URL`.

## Documentation

- Update the relevant file in `docs/` when changing product rules, roles,
  API contracts, data lifecycle, or grading behavior.
- Prefer concise, scoped changes. Do not refactor unrelated code.

## Graphify

- When `.graphify/graph.json` exists and the task is about architecture,
  dependencies, or impact analysis, query Graphify before broad raw-code search.
- Treat Graphify output as navigation/context, then verify material conclusions
  against the cited source files before editing.

## graphify

This project has a graphify knowledge graph at .graphify/.

Rules:
- For codebase or architecture questions, when `.graphify/graph.json` exists, first run `graphify query "<question>"` (or `graphify path "<A>" "<B>"` / `graphify explain "<concept>"`); these return a scoped subgraph, usually much smaller than `GRAPH_REPORT.md` or raw grep output
- If .graphify/wiki/index.md exists, navigate it instead of reading raw files
- In Codex, the reliable explicit skill invocation is `$graphify ...`; do not rely on `/graphify ...`
- `$graphify ...` is a Codex skill trigger, not a Bash subcommand like `graphify .`
- A successful TypeScript-backed Codex build should leave `.graphify/.graphify_runtime.json` with `runtime: typescript`
- If .graphify/graph.json is missing but graphify-out/graph.json exists, run `graphify migrate-state --dry-run` first; if tracked legacy artifacts are reported, ask before using the recommended `git mv -f graphify-out .graphify` and commit message
- If .graphify/needs_update exists or .graphify/branch.json has stale=true, warn before relying on semantic results and run the graphify skill with --update when appropriate
- If the user asks to build, update, query, path, or explain the graph, use the installed `graphify` skill instead of ad-hoc file traversal
- Before proposing or committing .graphify artifacts, run `graphify portable-check .graphify`; commit-safe graph artifacts must use repo-relative paths, and never commit .graphify/branch.json, .graphify/worktree.json, .graphify/needs_update, or .graphify/cache/. If a repo already tracks any of them, first add them to .gitignore, then propose `git rm --cached .graphify/branch.json .graphify/worktree.json .graphify/needs_update` and `git rm -r --cached .graphify/cache`; never mutate git state without asking
- Before deep graph traversal, prefer `graphify summary --graph .graphify/graph.json` for compact first-hop orientation
- For review impact on changed files, use `graphify review-delta --graph .graphify/graph.json` instead of generic traversal
- Read `.graphify/GRAPH_REPORT.md` only for broad architecture review or when `query` / `path` / `explain` do not surface enough context
- After modifying code files in this session, run `npx graphify hook-rebuild` to keep the graph current
