# UI flows

These flows describe the intended user journey at a product level. Detailed wireframes can be added once the stories and operating model are confirmed.

## Account access

```text
Sign up → Student selects tutor if applicable → Verification email → Verify link
→ Login → Role-appropriate home
```

- Registration captures name, email, password, and role.
- Student registration requires selecting a registered tutor who will review the
  student's submissions.
- An unverified user is told to verify before login.
- The post-login destination should be decided with the dashboard/operating-model design.

## Student practice

```text
Questions list → Filter/search → Question detail → Write answer free-form
→ Upload private handwriting image → Extract transcript → Review/correct transcript
→ Confirm transcript → AI grading → Provisional result → Tutor review
→ Tutor-reviewed result → My submissions → Revisit result
```

- The question list should only surface questions a student is allowed to attempt.
- Handwriting is the primary student answer-entry method in the first increment.
  Text-based controls are used to amend OCR output rather than offered as a
  separate primary entry path.
- The student must see and correct the extracted content before marking begins.
- The review screen should present the source handwriting alongside editable
  mathematical steps and a final answer.
- The result screen must distinguish automated feedback from tutor review.
- An AI score is labelled provisional. After review, the tutor score is the
  authoritative result.
- If automated feedback is unavailable, the student should see a clear state rather than a misleading score.

## Student progress

```text
Student dashboard → Overall performance → Topic breakdown → Related attempts and feedback
```

- Every summary should state its time period, attempt count, and score source.
- The dashboard must make preliminary and tutor-reviewed results distinguishable.

## Content-manager question authoring

```text
Content-manager question bank → Create question → Choose text, image, or handwriting input
→ Extract/review/correct when needed → Define prompt, model answer, and marks
→ Validate total marks → Save draft/publish → Question detail → Edit or unpublish
```

- Publishing policy and draft behaviour should be confirmed in the requirements.
- For image and handwriting authoring, the content manager must confirm the extracted question and marking content before saving.
- The authoring screen should make mark allocation and total marks easy to verify.

## Tutor review

```text
Review queue → Filter submissions → Open submission → Inspect question, answer,
automated feedback, and marks → Enter tutor score + feedback → Mark reviewed
```

- The review screen should retain automated feedback as context after a tutor overrides it.
- The review queue is scoped to students paired with the signed-in tutor.
- Review cards should show the student name, question title, status, submitted
  date, and score context.

## Tutor progress view

```text
Tutor dashboard → Student list → Select student → Overall performance
→ Topic breakdown → Relevant attempts → In-person or online support
```

- In the pilot model, tutors can open performance data only for paired students.
- Topic summaries should help a tutor identify where personalised support may be useful; they should not replace review of the underlying attempts.

## Empty and failure states

Every primary flow needs a designed response for:

- No questions or submissions available.
- Network/API failure.
- Expired session or insufficient permission.
- Failed or delayed AI feedback.
- Deleted or unavailable question/submission.
