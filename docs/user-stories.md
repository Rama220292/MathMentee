# User stories

Stories are ordered roughly by product priority. A story is complete only when its acceptance criteria are met.

## Student

### S1 — Create and access an account

As a student, I want to register and verify my email so that my work is associated with a secure account.

**Acceptance criteria**

- I can register with my name, email, password, and role.
- I receive a verification link and cannot sign in until verification succeeds.
- I receive a clear error for an existing email, invalid credentials, or expired verification link.

### S2 — Find an appropriate question

As a student, I want to browse published questions by topic and level so that I can select relevant practice.

**Acceptance criteria**

- I can see published questions only.
- I can filter and search questions by the available metadata.
- I can open a question and understand its prompt and total marks before attempting it.

### S3 — Submit mathematical working

As a student, I want to submit my mathematical working and final answer as typed text, a photo, or free-form handwriting so that I can use the format that best represents my solution and receive feedback on my method as well as my answer.

**Acceptance criteria**

- I can choose typed text, image upload, or free-form handwriting as my submission method.
- For typed text, I can add and remove working steps and enter a final answer.
- For image and handwriting submissions, the system processes the content into a structured form suitable for marking.
- I can review and correct extracted text and mathematical content before submitting it for marking.
- Required fields are validated before submission.
- My original submission and its processed/structured representation are saved with the question and time of submission.

### S4 — Understand feedback

As a student, I want to see my automated score, feedback, and mark breakdown so that I know what to improve.

**Acceptance criteria**

- I can see which feedback is automated and whether the work is awaiting review or reviewed.
- I can see the question, my answer, and the feedback together.
- I can view only my own submissions.

### S5 — Review past work

As a student, I want to view prior attempts so that I can track and revisit my practice.

**Acceptance criteria**

- My submissions are listed newest first.
- Each entry shows question, date, status, and current score.
- I can open the full result for an attempt.

### S6 — Understand my performance by topic

As a student, I want to view my overall score and scores by mathematics topic so that I can understand my progress and identify areas that need more practice.

**Acceptance criteria**

- I can view an overall performance summary based on my submissions.
- I can view a separate performance summary for each topic I have attempted.
- Each summary clearly states the period, attempts, and score calculation it represents.
- I can view only my own performance data.

## Tutor

### T1 — Use the shared question bank

As a tutor, I want to use questions from the tuition centre's shared question bank so that I can support students with consistent, approved content.

**Acceptance criteria**

- I can browse all published questions in the shared bank.
- I can view the question and approved model-answer/marking information needed to review a student's work.
- I cannot edit, publish, unpublish, archive, or restore question-bank content.

### T2 — Review student work

As a tutor, I want to see submissions and their automated feedback so that I can efficiently provide human review.

**Acceptance criteria**

- I can view submissions with student and question context.
- I can filter by review status, student, and level.
- I can enter a reviewed score and feedback.
- A reviewed score and feedback are visibly identified as tutor-reviewed and become the final result.

### T3 — Understand student performance by topic

As a tutor, I want to view each student's overall score and topic-specific scores so that I can identify students and topics where in-person or online support may be most useful.

**Acceptance criteria**

- I can view an overall performance summary for every student at the tuition centre.
- I can view a topic-specific performance summary for every student at the tuition centre.
- Each summary clearly states the period, attempts, and score calculation it represents.

## Content manager

### C1 — Manage the shared question bank

As a content manager, I want to create and manage every question in the shared question bank using typed text, uploaded images, or free-form handwriting so that all tutors and students can use accurate, consistent, approved content.

**Acceptance criteria**

- I can create, edit, publish, unpublish, and archive every question in the shared bank.
- I can choose typed text, image upload, or free-form handwriting when entering a question prompt and model answer.
- For image and handwriting input, the system processes the content into an editable structured form.
- I can review and correct the extracted question text, model-answer steps, final answer, and marks before saving.
- The total marks equal the step marks plus final-answer marks.
- Invalid or incomplete question data is rejected with an understandable message.
- Unpublished questions are not visible to students or tutors.

## System

### SY1 — Provide transparent automated feedback

As the system, I need to evaluate an attempt and preserve the result so that feedback is fast and auditable.

**Acceptance criteria**

- The system stores deterministic marks, AI feedback, and review status separately.
- The system preserves both original image/handwriting input and the processed content used for marking.
- Extracted content is not used for marking until the submitting user has had an opportunity to review it.
- If AI feedback fails, the submission is still retained with a clear recoverable state.
- The system never represents an AI score as a tutor-reviewed score.

### SY2 — Protect access

As the system, I need to enforce permissions on the API so that users cannot access or change data outside their role.

**Acceptance criteria**

- Authentication is required for questions and submissions.
- Students cannot access other students' submissions.
- Tutor-only review actions and content-manager-only question actions are rejected for students.
