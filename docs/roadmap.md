# Roadmap

This roadmap is outcome-led. It should be revisited after requirements validation, not treated as a fixed feature promise.

## Phase 0 — Foundation and decisions

**Outcome:** the team agrees on the target operating model and the rules that govern marking.

- Validate whether the first release is independent practice, tutor-led practice, or a defined combination.
- Finalise requirements, user stories, roles, grading design, schema direction, and API contracts.
- Record decisions and identify measures for a small pilot.

## Phase 1 — Reliable MVP

**Outcome:** a student can complete a trustworthy practice loop and a tutor can review it end to end.

- Complete error, loading, empty, and access-denied states.
- Align frontend API configuration with the backend `/api` base path.
- Resolve the question metadata route ordering issue.
- Split question API responses by role so students cannot retrieve model answers, mark allocations, authoring metadata, or original source assets.
- Make automated versus teacher-reviewed results clear to students.
- Decide and document how overall and topic-specific performance is calculated before building dashboards.
- Add automated tests for authentication, permissions, question CRUD, submissions, and score/review transitions.
- Verify production deployment, CORS, email verification, and secret handling.

## Phase 2 — Tutor-led workflow

**Outcome:** the tuition centre has a governed shared question bank and tutors can use it to give students purposeful work.

- Introduce `tutor` and `content_manager` roles and migrate existing teacher accounts deliberately.
- Move question management to content managers and give tutors read-only access to approved question and marking content.
- Introduce a tuition-centre/workspace boundary for users and the shared question bank.
- Introduce assignments with question selection, release rules, due dates, and attempt rules if the centre requires directed practice.
- Deliver student and tutor performance views with overall and topic-specific summaries, scoped to authorised students.

## Phase 2.5 — Flexible mathematical input

**Outcome:** students and tutors can provide mathematics in the format that is most natural to them without compromising marking integrity.

- Add secure private storage for question and submission images.
- Add free-form handwriting capture.
- Integrate OCR/vision processing as an asynchronous service.
- Provide an editable confirmation step before extracted content is saved for authoring or used for marking.
- Evaluate extraction accuracy against representative Singapore secondary-school mathematical notation.

## Phase 3 — Learning insight

**Outcome:** students and tutors can see progress and act on it.

- Expand the initial overall/topic performance views into relevant activity and performance summaries.
- Provide tutor review prioritisation and student-level history.
- Define feedback and progress views that are understandable and do not overstate automated certainty.

## Phase 4 — Better marking quality

**Outcome:** feedback better reflects valid mathematical reasoning.

- Build an evaluation dataset from tutor-marked examples.
- Improve answer checking by question type and investigate symbolic equivalence where it has demonstrated value.
- Add robust AI structured-output validation, confidence/review signals, and retry handling.
- Support richer rubrics where step-text matching is insufficient.

## Phase 5 — Operational maturity

**Outcome:** the product is ready for a broader pilot.

- Improve accessibility, mobile usability, observability, data retention, and backup practices.
- Define account support and safeguarding procedures.
- Add only validated communication, notification, and content-management needs.

## Sequencing rule

Do not begin a phase until its preceding outcome is demonstrably achieved. Within a phase, prioritise stories that remove risk from the core student practice and tutor review loop.
