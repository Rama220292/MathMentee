# Grading design

## Purpose

MathMentee gives students immediate feedback while preserving the tutor as the authority for reviewed outcomes.

## Current implementation

Each question has a model final answer, ordered model steps, marks per step, final-answer marks, and a calculated total.

On submission, the backend performs:

1. **Deterministic matching.** It normalizes case, whitespace, and the multiplication symbol, then compares submitted text to the model answer. For equations, it accepts the two sides in reverse order. It awards marks for matching final answer and model steps.
2. **AI feedback.** An OpenAI model receives the question, model answer, and student response and returns a JSON score and written feedback.
3. **Tutor review.** A tutor may set a score and feedback. Once reviewed, those values become the stored final score and final feedback.

## Current score fields

| Field | Meaning |
| --- | --- |
| `ai_score` / `ai_feedback` | Separate AI-produced result |
| `marks_breakdown` | Deterministic marks for model steps |
| `final_score` / `final_feedback` | Current official result; initially automated, then replaced by tutor review |
| `teacher_score` / `teacher_feedback` | Current implementation field name for the tutor's review record |

## Product decisions required

These decisions should be resolved before the grading system becomes more capable:

1. **Initial score authority:** should deterministic matching, AI, a combination, or no numeric score be shown before tutor review?
2. **Review policy:** which submissions require review—every submission, only low-confidence ones, or tutor-selected ones?
3. **Student visibility:** should model answers appear immediately, only after review, or after a configured release point?
4. **Resubmissions:** are they separate attempts, editable drafts, or replacements for a prior attempt?
5. **AI failure:** should feedback be retried asynchronously, shown as unavailable, or placed in a review queue?

## Design principles

- Clearly label automated and tutor-reviewed results.
- Preserve raw submissions and every score source for auditability.
- Preserve the original typed, image, or handwriting input alongside the extracted structured content used for marking.
- Require user confirmation or correction of OCR/handwriting extraction before using it as the basis of marking.
- Do not claim mathematical equivalence where the system only does text matching.
- Keep model answers and prompts server-side when exposure would undermine assessment design.
- Treat AI output as untrusted structured data: validate it, constrain it, and handle malformed output safely.

## Input processing requirements (planned)

Questions and submissions will support typed text, image upload, and free-form handwriting. Image and handwriting input should follow this pipeline:

```text
Original image or handwriting → OCR/vision extraction → editable structured content
→ user confirmation/correction → marking and feedback
```

The original input, extraction result, extraction status, and confirmed structured answer should be retained. Low-confidence extraction must not silently become the student's or tutor's intended mathematics.

## Performance summaries (planned)

Student and tutor dashboards will show overall and topic-specific performance using submissions the viewer is authorised to access. Before implementation, define:

- Which score is included: current `final_score`, tutor-reviewed score only, or a separately labelled preliminary score.
- How attempts are counted and whether repeated attempts are weighted equally.
- Whether unpublished/deleted questions and unreviewed submissions are included.
- The time period represented by a summary.

Until these rules are agreed, the product must not present a percentage or average as an unqualified measure of mastery.

## Future direction

Improve marking in layers: stronger text normalization, answer-type-specific validators, symbolic equivalence where justified, and rubric-guided AI feedback with confidence or review triggers. Each layer needs evaluation against real tutor-marked work before it is relied on for scores.
