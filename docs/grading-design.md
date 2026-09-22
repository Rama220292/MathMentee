# Grading design

## Purpose

MathMentee gives students immediate feedback while preserving the tutor as the authority for reviewed outcomes.

## Current implementation

Each question has a model final answer, ordered model steps, marks per step, final-answer marks, and a calculated total.

For the handwriting workflow, the backend sends only the student-confirmed
transcript to AI grading. The model receives the immutable question snapshot,
model answer, and mark allocation and returns a strictly structured score,
feedback, and marks breakdown. The backend rejects inconsistent totals or marks
that exceed their criterion allocation.

A tutor may then record a score and feedback. The AI result remains stored for
audit, while the tutor result becomes authoritative after review.

## Legacy score fields

| Field | Meaning |
| --- | --- |
| `ai_score` / `ai_feedback` | Separate AI-produced result |
| `marks_breakdown` | Deterministic marks for model steps |
| `final_score` / `final_feedback` | Current official result; initially automated, then replaced by tutor review |
| `teacher_score` / `teacher_feedback` | Current implementation field name for the tutor's review record |

This table describes older submissions created before the handwriting workflow.
The active score model below replaces it. The deterministic grading service
remains in the repository only as legacy code and is not called by the current
submission controller.

## Active score model

The handwriting workflow has two score sources:

| Field | Meaning |
| --- | --- |
| `ai_score` / `ai_feedback` | Provisional automated result generated from the student-confirmed transcript |
| `tutor_score` / `tutor_feedback` | Authoritative human-reviewed result; absent until review |

`review_status` determines which result is authoritative. While the status is
`ai_graded`, clients display the AI result as provisional. When the status is
`reviewed`, clients display the tutor result as authoritative. The target model
does not persist `final_score` or `final_feedback`, because those fields would
duplicate one of the two score sources.

The existing deterministic matcher is not part of the scoring decision. It must
not be presented as a general mathematical-equivalence engine or used as the
handwriting workflow's official score.

## Product decisions required

These decisions should be resolved before the grading system becomes more capable:

1. **Review policy:** whether every submission must be reviewed, or whether
   tutors may select from the review queue.
2. **Student visibility:** whether model answers appear immediately, only after
   review, after an assignment closes, or never by default.
3. **Resubmissions:** whether they are separate attempts, editable drafts, or
   replacements for a prior attempt.
4. **AI failure:** whether feedback is retried asynchronously, shown as
   unavailable, or placed in a review queue.

## Design principles

- Clearly label automated and tutor-reviewed results.
- Preserve the original handwriting, both transcript versions, and each actual
  score source for auditability.
- Preserve the original typed, image, or handwriting input alongside the extracted structured content used for marking.
- Require user confirmation or correction of OCR/handwriting extraction before using it as the basis of marking.
- Do not claim mathematical equivalence where the system only does text matching.
- Keep model answers and prompts server-side when exposure would undermine assessment design.
- Treat AI output as untrusted structured data: validate it, constrain it, and handle malformed output safely.

## Input processing requirements

The first student increment is handwriting-first and follows this pipeline:

```text
Free-form handwriting → private image upload → OCR/vision extraction
→ editable transcript → student confirmation → AI grading → tutor review
```

The private S3 image, untouched extracted transcript, extraction status, and
student-amended confirmed transcript are retained. Only the confirmed
transcript is gradeable. The first increment does not expose OCR or grading
confidence: mandatory student confirmation and explicit error states provide
the safety boundary.

OCR/transcription and grading are separate operations. The transcription
provider must not receive the model answer, because the expected answer could
bias what it reads from the image. The grading provider receives the confirmed
transcript, immutable question version, model answer, and mark allocation.

AI grading output must use a strict server-validated schema. The score must be
within the question's total marks, awarded criterion marks must not exceed their
allocations, and malformed output must place the submission in a recoverable
failure state rather than fabricate a result.

## Performance summaries (planned)

Student and tutor dashboards will show overall and topic-specific performance using submissions the viewer is authorised to access. Before implementation, define:

- Which score is included: tutor-reviewed scores only or separately labelled
  provisional AI scores as well.
- How attempts are counted and whether repeated attempts are weighted equally.
- Whether unpublished or archived questions and unreviewed submissions are included.
- The time period represented by a summary.

Until these rules are agreed, the product must not present a percentage or average as an unqualified measure of mastery.

## Future direction

Evaluate AI grading against real tutor-marked work before relying on it beyond
provisional feedback. Later improvements may include answer-type-specific
validators, symbolic equivalence where justified, and evidence-based review
triggers. A confidence field should be added only if it can be calibrated and
shown to improve decisions.
