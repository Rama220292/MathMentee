# UI flows

These flows describe the intended user journey at a product level. Detailed wireframes can be added once the stories and operating model are confirmed.

## Account access

```text
Sign up → Verification email → Verify link → Login → Role-appropriate home
```

- Registration captures name, email, password, and role.
- An unverified user is told to verify before login.
- The post-login destination should be decided with the dashboard/operating-model design.

## Student practice

```text
Questions list → Filter/search → Question detail → Choose text, image, or handwriting input
→ Extract/review/correct when needed → Submit working + final answer → Automated processing
→ Submission result → My submissions → Revisit result
```

- The question list should only surface questions a student is allowed to attempt.
- For image and handwriting input, the student must see and correct extracted content before marking begins.
- The result screen must distinguish automated feedback from tutor review.
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
- In a class-based future, the review queue should be scoped to the tutor's own students/classes.

## Tutor progress view

```text
Tutor dashboard → Student list → Select student → Overall performance
→ Topic breakdown → Relevant attempts → In-person or online support
```

- In the initial tuition-centre model, tutors can open performance data for every student in their tuition centre.
- Topic summaries should help a tutor identify where personalised support may be useful; they should not replace review of the underlying attempts.

## Empty and failure states

Every primary flow needs a designed response for:

- No questions or submissions available.
- Network/API failure.
- Expired session or insufficient permission.
- Failed or delayed AI feedback.
- Deleted or unavailable question/submission.
