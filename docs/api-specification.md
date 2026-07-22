# API specification

Base path: `/api`. All request and response bodies are JSON. Protected endpoints require `Authorization: Bearer <JWT>`.

## Conventions

- Success uses standard `2xx` status codes.
- Errors currently use `{ "err": "message" }`.
- Invalid request input returns `400`.
- Missing authentication or invalid token returns `401`; insufficient role returns `403`.
- Unknown resources return `404`.

## Health

| Method | Path | Auth | Purpose |
| --- | --- | --- |
| `GET` | `/health` | No | Returns `{ "status": "ok" }` |

## Authentication

| Method | Path | Auth | Purpose |
| --- | --- | --- |
| `POST` | `/auth/signup` | No | Register a student or teacher and send verification email |
| `POST` | `/auth/login` | No | Sign in and receive JWT plus basic user data |
| `GET` | `/auth/verify?token=…` | No | Verify an email token |

`POST /auth/signup` request:

```json
{ "name": "Aisha Tan", "email": "aisha@example.com", "password": "SecurePass1!", "role": "student" }
```

`POST /auth/login` response:

```json
{ "token": "<jwt>", "user": { "id": "<user-id>", "role": "student", "email": "aisha@example.com" } }
```

## Questions

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| `POST` | `/questions` | Content manager (planned; teacher currently) | Create a question |
| `GET` | `/questions` | Any signed-in user | List questions; supports `topic` and `level` query parameters |
| `GET` | `/questions/:id` | Any signed-in user | Fetch a question |
| `PUT` | `/questions/:id` | Content manager (planned; teacher currently) | Update a question |
| `DELETE` | `/questions/:id` | Content manager (planned; teacher currently) | Delete a question |
| `GET` | `/questions/meta/options` | Any signed-in user | Available topic and level values |

Under the planned tuition-centre model, `GET /questions` and student access to `GET /questions/:id` must return a student-safe representation that excludes model answers, mark allocations, authoring metadata, extraction data, and original source assets. Tutors receive the approved marking information needed for review; content managers receive the full authoring representation.

Question request shape:

```json
{
  "title": "Solve a linear equation",
  "question_text": "Solve 2x + 3 = 11.",
  "topic": "Algebra",
  "level": "Sec2",
  "model_answer": {
    "final_answer": "x = 4",
    "steps": [{ "content": "2x = 8", "marks": 1 }, { "content": "x = 4", "marks": 1 }]
  },
  "final_answer_marks": 1,
  "isPublished": true
}
```

## Submissions

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| `POST` | `/submissions` | Student | Create and automatically grade a submission |
| `PUT` | `/submissions/:id` | Student owner | Update a submission before review |
| `GET` | `/submissions/my` | Student | List own submissions |
| `GET` | `/submissions/:id` | Student owner or teacher | Fetch one submission |
| `GET` | `/submissions` | Tutor (planned; teacher currently) | List all submissions |
| `GET` | `/submissions/pending` | Tutor (planned; teacher currently) | List submissions not reviewed |
| `GET` | `/submissions/:id/review` | Tutor (planned; teacher currently) | Fetch a submission for review |
| `PUT` | `/submissions/:id/review` | Tutor (planned; teacher currently) | Save teacher score and feedback |

Create-submission request:

```json
{
  "questionId": "<question-id>",
  "raw_input": "2x = 8\nx = 4",
  "structured_answer": { "steps": ["2x = 8", "x = 4"], "final_answer": "x = 4" }
}
```

Review request:

```json
{ "teacher_score": 3, "teacher_feedback": "Correct method. State the final answer clearly." }
```

## Implementation notes

- The backend mounts API routers below `/api`; client configuration must therefore include that prefix or otherwise route requests through it.
- In the current question-router declaration order, `/questions/meta/options` appears after `/questions/:id`. It should be moved before the parameterised route so the metadata endpoint remains reachable.
- The current question response includes `model_answer` and mark allocations for any signed-in user. This must be split into role-appropriate response representations before students are given access to the shared question bank.
- The specification describes the current API. Any breaking changes should be recorded in `product-decisions.md` and implemented consistently in both client and server.

## Planned API additions

The endpoints below are planned contracts, not implemented endpoints. Their exact request shapes depend on the selected storage and OCR/vision provider.

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| `POST` | `/uploads` | Signed-in user | Create an authorised upload for question or submission image/handwriting input |
| `POST` | `/extractions` | Signed-in user | Request OCR/vision processing for an uploaded asset or handwriting payload |
| `GET` | `/extractions/:id` | Owner or authorised teacher | Check extraction status and result |
| `GET` | `/performance/me` | Student | Return own overall and topic-specific performance summary |
| `GET` | `/performance/students/:studentId` | Tutor | Return one student's overall and topic-specific performance summary |

For extracted input, APIs must return the original input reference, extraction status, confidence where available, and editable structured content. A separate confirmation/update operation must record the user's corrected content before it is used for marking.

Performance responses must identify their score source, date range, attempted-question count, and topic breakdown. Under the agreed tuition-centre model, tutors may access every student in their tuition centre; this may later be narrowed to assigned students/classes.
