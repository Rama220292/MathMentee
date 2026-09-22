# Product decisions

Use this file as a lightweight decision log. Each entry records the decision, why it was made, and what would cause it to be revisited.

## Decision status

| ID | Decision | Status |
| --- | --- | --- |
| D1 | MathMentee augments tutors rather than replacing them | Accepted |
| D2 | Initial target users are Singapore secondary-school students and tutors | Accepted |
| D3 | Tuition-centre operating model | Accepted |
| D4 | Authority of automated pre-review scores | Accepted |
| D5 | Model-answer release policy | Open |
| D6 | Resubmission/attempt policy | Open |
| D7 | Image and handwriting input processing | Accepted |
| D8 | Performance-summary calculation | Open |
| D9 | Shared question-bank governance | Accepted |
| D10 | Managed persistence for deployed environments | Accepted |
| D11 | Tutor-student pairing for pilot review access | Accepted |

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

**Status:** Accepted

The first handwriting workflow will use an AI-generated score and feedback as
the only automated result. It must be labelled provisional until a tutor
reviews the submission. A tutor's score and feedback become authoritative when
`review_status` changes to `reviewed`.

Submissions will store `ai_score` / `ai_feedback` and `tutor_score` /
`tutor_feedback`. They will not store a duplicate `final_score` or
`final_feedback`; consumers select the authoritative result from
`review_status`. The existing deterministic matcher will not determine the
score for this workflow.

**Reason:** AI can evaluate mathematical reasoning that the current exact-text
matcher cannot, while tutor review preserves human authority. Keeping only the
two actual score sources avoids ambiguous or duplicated state.

**Revisit when:** evaluation against tutor-marked work supports a different
automated strategy, or a dependable answer-type-specific or symbolic checker is
introduced.

## D5 — Model-answer release policy

**Status:** Open

Decide when students may see model answers: immediately after submission, after review, after an assignment closes, or never by default.

## D6 — Attempt policy

**Status:** Open

Decide whether students can have unlimited practice attempts, a limited number of assignment attempts, editable drafts, or immutable submissions.

## D7 — Image and handwriting input processing

**Status:** Accepted

The first student-input increment will be handwriting-first. A student writes
an answer in a free-form surface, which is rendered to an image and uploaded
directly to private S3 through a short-lived, owner-scoped URL. The original
image remains available to authorised tutors for review and audit.

The backend uses server-side OCR/vision to create an editable mathematical
transcript. MongoDB retains both the untouched extracted transcript and the
student's amended, confirmed transcript. Only the confirmed transcript may be
sent for grading. Text editing remains part of the correction screen rather
than a separate primary answer-entry path in this increment.

The first increment will not store or display OCR or grading confidence. Every
student reviews the transcription, AI output is schema-validated, and every AI
score remains provisional until tutor review. Explicit processing and failure
states are required instead of a potentially misleading confidence number.

**Reason:** retaining the source image lets a tutor compare the transcription
with what the student actually wrote. Retaining both transcript versions makes
corrections auditable and supports later OCR evaluation, while mandatory
confirmation prevents transcription errors from silently affecting marks.

**Revisit when:** accessibility testing shows that a direct typed-answer path
is needed, source-image retention requirements are defined, or OCR evaluation
supports more selective review.

**Required principle:** extracted content remains editable and must be confirmed by the author or student before it is used for marking.

## D8 — Performance-summary calculation

**Status:** Open

Students need overall and topic-specific performance views; tutors need the same for students they are authorised to teach. Define the score source, attempt policy, time period, topic grouping, treatment of unreviewed work, and presentation language.

**Required principle:** summaries must communicate what they measure and must not present preliminary automated results as verified mastery.

## D9 — Shared question-bank governance

**Status:** Accepted

Questions belong to the tuition centre's shared question bank rather than to individual tutors. Content managers can create, edit, publish, unpublish, and archive every question. They also inherit every tutor permission, allowing them to review student work and view student performance data when they concurrently take on teaching responsibility. Tutors can use all published questions and their approved marking information, but cannot change question-bank content. Students can access all published questions but not model answers, marking schemes, source assets, or authoring metadata.

**Reason:** Central content governance provides a consistent standard while keeping tutors focused on review and student support.

## D10 — Managed persistence for deployed environments

**Status:** Accepted

Deployed environments use managed MongoDB rather than relying on a database
process or data files on a developer's computer. The application currently
supports MongoDB Atlas through the backend-only `MONGO_URI`. Handwriting images
are stored separately in private S3; MongoDB stores their object keys and text
metadata rather than image binaries.

Development and production must use separate databases and private S3 storage
boundaries. Before a pilot with real student data, production storage must have
restricted service credentials and network access, monitoring, a documented
backup and restoration procedure, and explicit retention/deletion rules.

**Reason:** students and deployed services need durable, shared access that is
not tied to one development machine. Environment separation prevents test data
and credentials from contaminating production, while backups and restoration
protect against accidental loss.

**Revisit when:** scale, residency, operational, or regulatory requirements
justify a different managed database or storage architecture.

## D11 — Tutor-student pairing for pilot review access

**Status:** Accepted

Students choose a registered tutor during signup. A teacher can list, view, and
review only submissions from students paired to that teacher. Content managers
retain broad administrative access to review data during the pilot.

**Reason:** The pilot needs a simple privacy boundary before real tutors and
students use the product. Direct pairing is sufficient before classes,
workspaces, or cohort management exist.

**Revisit when:** schools or tuition centres need multiple tutors per student,
class/cohort membership, temporary cover tutors, or organisation-level admin
delegation.
