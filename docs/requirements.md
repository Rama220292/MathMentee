# Requirements

## Product vision

MathMentee supports structured secondary-school mathematics practice for students in Singapore. It combines scalable, immediate technology-assisted feedback with tutor review and judgment; it is intended to augment tutors, not replace them.

## Problem statement

### Students

1. Not every student can afford private mathematics tuition.
2. Access to qualified tutors is limited by their availability.

### Tutors

1. Teaching workload scales with class size, making it harder to preserve teaching quality as a class grows.
2. Personalised feedback creates a substantial cognitive workload, making it difficult to give every student the attention they need.

## Users

- **Student:** a Singapore secondary-school learner practising mathematics.
- **Tutor:** an educator who uses the shared question bank, reviews student work, and subsequently provides in-person or online support if the student requests it.
- **Content manager:** a tuition-centre staff member who creates, edits, publishes, archives, and governs questions in the shared question bank.

## Goals

- Give students a structured way to show mathematical working, not only a final answer.
- Provide preliminary, immediate, understandable feedback after a submission.
- Let tutors efficiently identify and review work that needs human attention.
- Keep a clear record of attempts, feedback, and final reviewed outcomes.
- Provide data on how well each student performs in each topic.

## Non-goals for the current MVP

- Replacing human tutors or issuing high-stakes grades without teacher oversight.
- Supporting every mathematics topic or every school system.
- General symbolic equivalence checking or computer-algebra-system functionality.
- Class management, assignments, payments, messaging, or parent access.

## Functional requirements

### Account access

- Users can register as a student, tutor, or content manager, verify their email address, and sign in securely.
- The system enforces role-based access to tutor and content-manager actions.

### Question-bank management

- Content managers can create, edit, publish, unpublish, and archive questions in the shared question bank.
- A question includes a title, prompt, Singapore secondary-school level, topic, model answer steps, and mark allocation.
- All students can view all published questions and filter them by level and topic.
- Tutors can use all published questions when reviewing and supporting students, but cannot alter question-bank content.

### Submission and feedback

- Students can submit working steps and a final answer to a question.
- The system records the original response, marks breakdown, automated feedback, and submission status.
- Students can view their own submissions and results.
- A tutor can review a submission and replace the automated score and feedback.

## Quality requirements

- **Privacy:** protect account credentials and keep student submissions accessible only to their owner and authorised tutors.
- **Transparency:** distinguish automated feedback from tutor-reviewed feedback.
- **Reliability:** a failed AI response must not corrupt or lose a submission.
- **Usability:** a student should be able to submit working in a clear, low-friction form.
- **Accessibility:** future UI work should target keyboard navigation, readable contrast, and usable mobile layouts.

## Success measures to define

The following measures need targets before a pilot:

- Student completion rate for an assigned/practice question.
- Median time from submission to useful feedback.
- Tutor time spent per reviewed submission.
- Percentage of automated feedback a tutor accepts without material correction.
- Student-reported usefulness of feedback.
