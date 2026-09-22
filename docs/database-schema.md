# Database schema

Application text data is stored in MongoDB. Deployed environments use a
managed database configured through the backend-only `MONGO_URI`; development
and production data must be separated. Private image binaries belong in S3,
with MongoDB retaining only object references and metadata. Backup, restore,
monitoring, and retention procedures must be established before a real-student
pilot.

## Current entities

### User

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | Required |
| `email` | string | Required, unique |
| `hashedPassword` | string | Required; excluded from JSON output |
| `role` | enum | `student`, `teacher`, or `content_manager` |
| `assignedTutor` | User reference | Required for newly registered students; points to the teacher who may review that student's work |
| `isVerified` | boolean | Email-verification state |
| `verificationToken` / `verificationTokenExpiry` | string / date | Used during email verification |
| timestamps | dates | `createdAt`, `updatedAt` |

### Question

| Field | Type | Notes |
| --- | --- | --- |
| `title` / `question_text` | string | Required once the draft reaches `ready` or `published` |
| `topic` | enum | Currently `Algebra` or `Geometry` |
| `level` | enum | Currently `Sec1`–`Sec4` |
| `model_answer.final_answer` | string | Required |
| `model_answer.steps` | array | Each step has `content` and `marks` |
| `final_answer_marks` / `total_marks` | number | Total is calculated from the marking scheme |
| `created_by` | User reference | Content-manager author; retained for audit even though questions belong to the shared bank |
| `authoring_status` | enum | `uploaded`, `extracting`, `extracted`, `ready`, `published`, `error`, or `archived` |
| `source_asset` | object | Private S3 key and verified metadata; excluded from queries unless explicitly selected for content managers |
| `extraction` | object | Provider/model, processing status, confidence, review notes, safe error state, and completion time |
| `isPublished` | boolean | Defaults to `false`; controls student and tutor visibility |
| `current_version` / `published_version` | QuestionVersion references | Latest saved version and immutable version used for new attempts |
| `version_count` | number | Monotonic saved-version counter |
| `archived_at` / `archived_by` / `status_before_archive` | date / User reference / enum | Reversible archive audit metadata and restoration state |
| timestamps | dates | `createdAt`, `updatedAt` |

### QuestionVersion

Each explicit save of complete question content creates an immutable version.

| Field | Type | Notes |
| --- | --- | --- |
| `question` | Question reference | Stable logical question identity |
| `version_number` | number | Monotonic within the question; unique with `question` |
| question and marking fields | snapshot | Immutable prompt, model answer, step marks, final marks, and total marks |
| `created_by` | User reference | Content manager who saved the version |
| timestamps | dates | Version creation audit data |

### QuestionImageUpload

| Field | Type | Notes |
| --- | --- | --- |
| `created_by` | User reference | Owner used to authorise confirmation |
| `object_key` | string | Unique private S3 key; never supplied by the browser during confirmation |
| `content_type` / `size` | string / number | Expected metadata captured before issuing the presigned URL |
| `expires_at` | date | Confirmation deadline matching the short-lived upload request |
| `status` | enum | `pending` or `confirmed` |
| `confirmed_at` | date | Successful S3 verification time |
| `question` | Question reference | Draft created from the confirmed object |
| timestamps | dates | `createdAt`, `updatedAt` |

### Submission

The model retains legacy typed fields so existing documents remain readable,
but new student attempts use the handwriting fields below.
Legacy `teacher_score` and `final_score` fields are hidden migration-only fields;
response mapping translates a historical reviewed result to `tutor_score` and
never exposes the old names. New writes do not populate them.

| Field | Type | Notes |
| --- | --- | --- |
| `studentId` | User reference | Required |
| `questionId` | Question reference | Required |
| `questionVersionId` | QuestionVersion reference | Exact published version used for the attempt |
| `question_snapshot` | object | Defensive immutable copy of the question and marking scheme used for the attempt |
| `input_method` | enum | `handwriting` for new student attempts; `text` identifies legacy submissions |
| `processing_status` | enum | Upload, extraction, grading, failure, and review lifecycle |
| `source_asset` | object | Private S3 key and verified PNG metadata; excluded from ordinary queries |
| `extracted_answer` | object | Untouched OCR output, review notes, and extraction time |
| `confirmed_answer` | object | Student-amended steps and final answer used for grading |
| `raw_input` | string | Original joined working input |
| `structured_answer` | object | `final_answer` and array of `steps` |
| `ai_score` / `ai_feedback` | number / string | Provisional AI output |
| `marks_breakdown` | array | AI criterion, allocation, awarded marks, evidence, and feedback |
| `review_status` | enum | `pending`, `ai_graded`, or `reviewed` |
| `reviewed_by` / `reviewed_at` | User reference / date | Tutor review metadata |
| `tutor_score` / `tutor_feedback` | number / string | Authoritative reviewed result |
| `tutor_marks_breakdown` | array | Authoritative tutor-reviewed criterion marks, allocations, evidence, and feedback |
| timestamps | dates | `createdAt`, `updatedAt` |

### Handwriting input representation

New student submissions use the following handwriting-first representation.

| Field | Type | Purpose |
| --- | --- | --- |
| `input_method` | enum | `handwriting` for the first student increment; leaves room for later alternatives |
| `source_asset` | object | Private S3 object key, verified content type, size, upload time, and confirmation time |
| `processing_status` | enum | `uploaded`, `extracting`, `extracted`, `grading`, `ai_graded`, `grading_error`, or `reviewed` |
| `extracted_answer` | object | Untouched OCR/vision output containing raw text, mathematical steps, final answer, and extraction time |
| `confirmed_answer` | object | Student-amended steps and final answer, with `confirmed_at`; the only answer used for grading |
| `ai_score` / `ai_feedback` | number / string | Provisional schema-validated AI result |
| `ai_marks_breakdown` | array | Marks and evidence for each marking criterion |
| `tutor_score` / `tutor_feedback` | number / string | Authoritative reviewed result; absent before tutor review |
| `tutor_marks_breakdown` | array | Tutor-edited criterion marks; absent before tutor review unless saved |
| `reviewed_by` / `reviewed_at` | User reference / date | Tutor review audit metadata |

Do not store large image binaries in ordinary MongoDB documents. Store private object references and access them through authorised backend endpoints or time-limited signed URLs.

The target model does not include `final_score` or `final_feedback`.
`review_status` selects the displayed result: `ai_score` while provisional and
`tutor_score` after review. It also does not include an OCR or grading confidence
field in the first increment.

## Performance data

Overall and topic-specific scores should initially be derived from submissions rather than stored as mutable user fields. This avoids stale summaries when a teacher changes a review. A future aggregate/cache may be introduced only with a defined recalculation strategy and the agreed score/attempt policy.

## Relationships

```text
User (content manager) 1 ─── * Question
User (content manager) 1 ─── * QuestionImageUpload ─── 0..1 Question
User (tutor) 1 ─── * User (assigned students)
User (student) 1 ─── * Submission * ─── 1 Question
User (tutor) 1 ─── * Submission (reviewed_by)
```

## Lifecycle rules

- A question's `total_marks` is derived from its model-step marks and final-answer marks.
- An image-authored question starts unpublished in `uploaded` state only after S3 metadata matches its owner-scoped pending upload record.
- A manually authored question also starts unpublished in `ready` state.
- Only an explicitly reviewed `ready` question can be published; unpublishing returns it to `ready` without deleting it.
- Editing creates a new immutable version; publishing promotes that version only for future attempts.
- Submissions retain their original version reference and snapshot for grading and review.
- Existing questions created before versioning receive a baseline version on their next edit, publication action, or new student attempt. Legacy submissions still lacking a version are pinned to that pre-edit baseline at the same time.
- Archiving preserves the question, every version, private source assets, and submission history; restoring returns it to `ready` and unpublished.
- Private `source_asset` fields are excluded from ordinary question queries and explicitly selected only for content-manager authoring responses.
- Students and tutors see only published questions in question listings and direct question lookups.
- In the target handwriting workflow, a submission progresses through upload,
  extraction, student confirmation, AI grading, and tutor review. Grading cannot
  start until `confirmed_answer` exists.
- The source image remains private in S3. MongoDB retains both the untouched
  extracted transcript and the student's confirmed transcript.
- An `ai_graded` submission exposes a provisional AI result. A `reviewed`
  submission uses the tutor result as authoritative without copying it into a
  separate final-score field.
- A student cannot update a submission once it is reviewed.
- Teachers can list, view, access source images for, and review submissions
  only when the submission belongs to a student whose `assignedTutor` is that
  teacher. Content managers retain broader administrative review access.

## Likely future entities

These should be added only when supported by agreed user stories:

| Entity | Enables |
| --- | --- |
| Tuition centre / workspace | Organisation boundary for the shared question bank, users, and future multi-centre access |
| Class / cohort | Grouping above direct tutor-to-student membership |
| Assignment | Distributing questions with due dates and release settings |
| Attempt | Multiple named or versioned attempts per assignment/question |
| Rubric | Richer criteria beyond exact model-step matching |
| Feedback event | Async feedback retries and audit history |
| Input asset / extraction job | Private image/handwriting storage and asynchronous OCR/vision processing |
| Performance aggregate | Cached overall/topic summaries, if derived queries later become too costly |

## Schema decisions to resolve

- Preserve a snapshot of the question and rubric on each submission versus rely on the current question document.
- Define unique-attempt rules: one submission per question, unlimited practice, or assignment-specific attempts.
- Add indexes for common queries once data size justifies them, especially `Submission(studentId, createdAt)` and review-queue filters.
- Set a specific retention period for reviewed handwriting images. Until that
  policy is accepted, retain them privately so tutors can compare the source
  work with both transcripts.
