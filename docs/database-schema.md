# Database schema

## Current entities

### User

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Required |
| `email` | string | Required, unique |
| `hashedPassword` | string | Required; excluded from JSON output |
| `role` | enum | `student` or `teacher` |
| `isVerified` | boolean | Email-verification state |
| `verificationToken` / `verificationTokenExpiry` | string / date | Used during email verification |
| timestamps | dates | `createdAt`, `updatedAt` |

### Question

| Field | Type | Notes |
| --- | --- | --- |
| `title` / `question_text` | string | Required |
| `topic` | enum | Currently `Algebra` or `Geometry` |
| `level` | enum | Currently `Sec1`–`Sec4` |
| `model_answer.final_answer` | string | Required |
| `model_answer.steps` | array | Each step has `content` and `marks` |
| `final_answer_marks` / `total_marks` | number | Total is calculated from the marking scheme |
| `created_by` | User reference | Content-manager author; retained for audit even though questions belong to the shared bank |
| `isPublished` | boolean | Controls student visibility |
| timestamps | dates | `createdAt`, `updatedAt` |

### Submission

| Field | Type | Notes |
| --- | --- | --- |
| `studentId` | User reference | Required |
| `questionId` | Question reference | Required |
| `raw_input` | string | Original joined working input |
| `structured_answer` | object | `final_answer` and array of `steps` |
| `ai_score` / `ai_feedback` | number / string | AI output |
| `marks_breakdown` | array | Step index, marks awarded, feedback |
| `review_status` | enum | `pending`, `ai_graded`, or `reviewed` |
| `reviewed_by` / `reviewedAt` | User reference / date | Tutor review metadata (current field design) |
| `teacher_score` / `teacher_feedback` | number / string | Tutor result; field names reflect the current implementation |
| `final_score` / `final_feedback` | number / string | Current official result |
| timestamps | dates | `createdAt`, `updatedAt` |

### Planned input representation

The current schema supports typed `raw_input` and `structured_answer` only. To support image and free-form handwriting without losing the source material, introduce an input representation for both questions and submissions.

| Field | Type | Purpose |
| --- | --- | --- |
| `input_method` | enum | `text`, `image`, or `handwriting` |
| `original_assets` | array | Private object-storage references and file metadata for original images or handwriting renders |
| `raw_input` | string | Typed input or extracted raw text |
| `extraction` | object | Provider, status, confidence, extracted content, and error information |
| `structured_answer` / structured question content | object | User-confirmed content used by marking and display |
| `confirmedAt` | date | When the author or student confirmed/corrected extraction |

Do not store large image binaries in ordinary MongoDB documents. Store private object references and access them through authorised backend endpoints or time-limited signed URLs.

## Performance data

Overall and topic-specific scores should initially be derived from submissions rather than stored as mutable user fields. This avoids stale summaries when a teacher changes a review. A future aggregate/cache may be introduced only with a defined recalculation strategy and the agreed score/attempt policy.

## Relationships

```text
User (content manager) 1 ─── * Question
User (student) 1 ─── * Submission * ─── 1 Question
User (tutor) 1 ─── * Submission (reviewed_by)
```

## Lifecycle rules

- A question's `total_marks` is derived from its model-step marks and final-answer marks.
- Students see only published questions in question listings.
- A submission begins as `pending`, becomes `ai_graded` after automated processing, and becomes `reviewed` after teacher review.
- A student cannot update a submission once it is reviewed.

## Likely future entities

These should be added only when supported by agreed user stories:

| Entity | Enables |
| --- | --- |
| Tuition centre / workspace | Organisation boundary for the shared question bank, users, and future multi-centre access |
| Class / cohort | Tutor-to-student membership if all-tutor access is later narrowed |
| Assignment | Distributing questions with due dates and release settings |
| Attempt | Multiple named or versioned attempts per assignment/question |
| Question version | Reproducible marking if a question changes after submission |
| Rubric | Richer criteria beyond exact model-step matching |
| Feedback event | Async feedback retries and audit history |
| Input asset / extraction job | Private image/handwriting storage and asynchronous OCR/vision processing |
| Performance aggregate | Cached overall/topic summaries, if derived queries later become too costly |

## Schema decisions to resolve

- Preserve a snapshot of the question and rubric on each submission versus rely on the current question document.
- Define unique-attempt rules: one submission per question, unlimited practice, or assignment-specific attempts.
- Add indexes for common queries once data size justifies them, especially `Submission(studentId, createdAt)` and review-queue filters.
- Define how original input assets are retained, deleted, and protected, including consent and data-retention requirements for student work.
