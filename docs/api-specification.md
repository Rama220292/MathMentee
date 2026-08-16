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
| `POST` | `/questions` | Content manager | Create a ready, unpublished question |
| `GET` | `/questions` | Any signed-in user | List questions; supports `topic` and `level` query parameters |
| `GET` | `/questions/:id` | Any signed-in user | Fetch a question |
| `PUT` | `/questions/:id` | Content manager | Update question content without changing publication state |
| `PATCH` | `/questions/:id/publication` | Content manager | Explicitly publish or unpublish a reviewed question |
| `PATCH` | `/questions/:id/archive` | Content manager | Archive or restore a question without deleting its history |
| `POST` | `/questions/image-upload-requests` | Content manager | Validate image metadata and create a short-lived private S3 upload URL |
| `POST` | `/questions/image-upload-confirmations` | Content manager | Verify the uploaded S3 object and create an unpublished question draft |
| `GET` | `/questions/meta/options` | Any signed-in user | Available topic and level values |

Only content managers receive unpublished questions from `GET /questions` or
`GET /questions/:id`. Students and tutors receive published questions only.
Student responses must exclude model answers, mark allocations, authoring
metadata, extraction data, and original source assets. Tutors receive the
approved marking information needed for review; content managers receive the
full authoring representation.

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
  "final_answer_marks": 1
}
```

Creation and content updates never publish implicitly. After reviewing a ready
question, the content manager changes visibility explicitly:

```json
{ "isPublished": true }
```

Publishing changes `authoring_status` from `ready` to `published`; unpublishing
changes it back to `ready`. Drafts still in upload, extraction, or error states
cannot be published.

Saving complete question content creates an immutable `QuestionVersion`.
Editing a published question creates a new current version without changing the
version served to students. Publishing again promotes the current version for
future attempts. Each submission stores both the published version identifier
and an immutable question snapshot, so later edits cannot alter its grading or
review context.

Archiving uses `{ "archived": true }`; restoring uses
`{ "archived": false }`. Archiving unpublishes the question and removes it from
active lists while retaining the question, all versions, its private source
asset, and submission references. Restored questions return to their previous
draft state and remain unpublished; previously published questions return as
ready.

Question-image upload request:

```json
{ "filename": "question.png", "contentType": "image/png", "size": 123456 }
```

The server validates the metadata and returns a URL scoped to one generated
object key for five minutes. The client must send the returned headers unchanged
when uploading the file with `PUT`:

```json
{
  "uploadId": "<pending-upload-id>",
  "uploadUrl": "<short-lived presigned S3 URL>",
  "objectKey": "question-source-images/<content-manager-id>/<upload-id>.png",
  "expiresAt": "2026-08-06T02:05:00.000Z",
  "headers": { "Content-Type": "image/png" }
}
```

The bucket must remain private. `objectKey` is an internal asset reference, not
a student-facing or public image URL. AWS credentials are resolved only by the
backend using the standard AWS credential chain.

After receiving this response, the browser uploads the original file directly
to `uploadUrl` with `PUT` and the returned headers. A successful S3 upload
returns an empty response. The browser then confirms the opaque pending upload:

```json
{ "uploadId": "<pending-upload-id>" }
```

The backend resolves the expected private key from the owner-scoped pending
upload record and calls S3 `HeadObject`. It requires the stored content type and
size to match the original request before creating an unpublished question with
`authoring_status: "uploaded"`. Confirmation returns only safe draft metadata:

```json
{
  "draftId": "<question-id>",
  "status": "uploaded",
  "sourceAsset": { "contentType": "image/png", "size": 123456 },
  "confirmedAt": "2026-08-06T02:01:00.000Z"
}
```

The browser must never persist or expose `uploadUrl`, because it grants
temporary write access to one object key. Student and tutor question responses
exclude the private source-asset record; content managers may receive it for
authoring operations.

### Extract a confirmed image draft

`POST /api/questions/:id/extractions` requires the `content_manager` role and
ownership of the unpublished draft. The backend reads the private S3 object and
sends it to the configured server-side OpenAI model. It returns editable
question content, confidence, and review notes. Extraction is synchronous in
this first increment.

The result is untrusted draft data containing extracted question content plus
an AI-proposed worked solution, final answer, and suggested mark allocation.
These answer and marking fields are not an authoritative marking scheme. The
content manager must review and correct every field before the draft becomes
ready or is explicitly published.

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
