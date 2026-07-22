# Product decisions

Use this file as a lightweight decision log. Each entry records the decision, why it was made, and what would cause it to be revisited.

## Decision status

| ID | Decision | Status |
| --- | --- | --- |
| D1 | MathMentee augments tutors rather than replacing them | Accepted |
| D2 | Initial target users are Singapore secondary-school students and tutors | Accepted |
| D3 | Tuition-centre operating model | Accepted |
| D4 | Authority of automated pre-review scores | Open |
| D5 | Model-answer release policy | Open |
| D6 | Resubmission/attempt policy | Open |
| D7 | Image and handwriting input processing | Open |
| D8 | Performance-summary calculation | Open |
| D9 | Shared question-bank governance | Accepted |

## D1 — Augment, do not replace, tutors

**Status:** Accepted

MathMentee will use technology for structured practice and immediate feedback while retaining tutors' judgment and personalised intervention. Tutor review is a first-class workflow, not an exception path.

**Reason:** Educational support includes context, motivation, and judgment that the product should not claim to replace.

## D2 — Singapore secondary-school focus

**Status:** Accepted

The initial content scope is Singapore Secondary 1–4 mathematics, beginning with Algebra and Geometry.

**Reason:** A focused curriculum and audience make question design, evaluation, and tutor feedback more coherent.

## D3 — Tuition-centre operating model

**Status:** Accepted

MathMentee will operate initially as a tuition-centre product. Content managers govern the shared question bank; tutors use that bank to review and support students; every student in the tuition centre can access all published questions.

**Why it matters:** It determines content ownership, role design, data access, and the future organisation/workspace boundary.

## D4 — Automated-score authority

**Status:** Open

Decide the meaning of the score visible before tutor review. Options include deterministic only, AI only, combined, provisional/no score, or review-required.

**Why it matters:** The current system stores multiple scores. A clear authority rule is necessary for trust and data consistency.

## D5 — Model-answer release policy

**Status:** Open

Decide when students may see model answers: immediately after submission, after review, after an assignment closes, or never by default.

## D6 — Attempt policy

**Status:** Open

Decide whether students can have unlimited practice attempts, a limited number of assignment attempts, editable drafts, or immutable submissions.

## D7 — Image and handwriting input processing

**Status:** Open

MathMentee will support typed text, uploaded images, and free-form handwriting for question authoring and student submissions. Decide the storage provider, OCR/vision approach, supported file types and limits, and the confidence/confirmation policy.

**Required principle:** extracted content remains editable and must be confirmed by the author or student before it is used for marking.

## D8 — Performance-summary calculation

**Status:** Open

Students need overall and topic-specific performance views; tutors need the same for students they are authorised to teach. Define the score source, attempt policy, time period, topic grouping, treatment of unreviewed work, and presentation language.

**Required principle:** summaries must communicate what they measure and must not present preliminary automated results as verified mastery.

## D9 — Shared question-bank governance

**Status:** Accepted

Questions belong to the tuition centre's shared question bank rather than to individual tutors. Content managers can create, edit, publish, unpublish, and archive every question. They also inherit every tutor permission, allowing them to review student work and view student performance data when they concurrently take on teaching responsibility. Tutors can use all published questions and their approved marking information, but cannot change question-bank content. Students can access all published questions but not model answers, marking schemes, source assets, or authoring metadata.

**Reason:** Central content governance provides a consistent standard while keeping tutors focused on review and student support.
