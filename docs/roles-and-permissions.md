# Roles and permissions

## Roles

- **Student:** accesses all published questions, completes practice, and views their own work.
- **Teacher (tutor):** currently has the same question-authoring rights as a content manager: creates and uploads questions, reviews drafts and marking schemes, and manages publication in the shared question bank. Reviews work from paired students.
- **Content manager:** manages every question in the shared question bank and can review student work. Existing accounts remain active; self-registration is temporarily disabled.

## Permission matrix

| Action | Student | Teacher | Content manager |
| --- | :---: | :---: | :---: |
| Self-register | Yes | Yes | Disabled by default |
| Verify an existing account and sign in | Yes | Yes | Yes |
| Browse all published questions | Yes | Yes | Yes |
| Browse unpublished questions | No | Yes | Yes |
| View approved model answers and marking information | No | Yes | Yes |
| Create, upload, extract, edit, publish, unpublish, archive, or restore questions | No | Yes | Yes |
| View or edit authoring metadata for any question, including model answer, marks, draft state, and extracted content | No | Yes | Yes |
| Access private source-asset metadata for question authoring | No | Yes | Yes |
| Create or update own answer submission before review | Yes | No | No |
| View own answer submissions | Yes | No | No |
| View a student's answer submission | Own only | Paired students | All students |
| View original uploaded/handwritten input for an answer submission | Own only | Paired students | All students |
| Create a review for a student answer submission | No | Yes | Yes |
| View or edit own review of a student answer submission | No | Yes | Yes |
| View student answer submission lists | No | Paired students | All students |
| View own overall and topic performance | Yes | No | No |
| View all students' overall and topic performance | No | Yes | Yes |

## Current enforcement

The API uses a signed JWT carrying user ID and one of three roles: `student`, `teacher`, or `content_manager`. `verifyToken` authenticates protected routes and `verifyRole` enforces endpoint permissions. Both teachers and content managers receive the full question-authoring representation, including drafts, archived questions, private source-asset metadata, and pending edits. Students receive published question content only, with model answers, marking allocations, extraction data, and authoring metadata excluded.

Question upload confirmations and extraction remain scoped to the uploading author's own records. Source images remain in private S3 storage.

`ENABLE_CONTENT_MANAGER_SIGNUP` is a backend setting, disabled unless its value is exactly `true`. Disabled content-manager registration returns `403`, including direct API requests. The signup form loads available roles from `GET /api/auth/signup-options`. Set the flag to `true` and restart the backend to re-enable the option and API registration; no frontend rebuild or role migration is needed. Existing content-manager login and permissions are unaffected.

Teacher submission review remains scoped to paired students. This temporary expansion concerns question authoring and publication.

Students are additionally checked against the submission owner when requesting a single submission or attempting an update.

Original uploaded images and handwriting are part of a submission. They must inherit the same access control as the submission and must not be exposed by a public file URL.

## Rules to decide before classroom features

- Whether tutors should ultimately see all students or only students assigned to them.
- Whether administrators are needed for account, content-manager assignment, and safeguarding management.
- What happens to submissions when a question is unpublished or deleted.
