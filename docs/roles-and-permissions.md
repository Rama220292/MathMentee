# Roles and permissions

## Roles

- **Student:** accesses all published questions, completes practice, and views their own work.
- **Tutor:** uses the shared question bank, reviews student work, and provides follow-up support.
- **Content manager:** manages every question in the tuition centre's shared question bank and can concurrently fulfil the tutor role.

## Permission matrix

| Action | Student | Tutor | Content manager |
| --- | :---: | :---: | :---: |
| Register, verify an account, and sign in | Yes | Yes | Yes |
| Browse all published questions | Yes | Yes | Yes |
| Browse unpublished questions | No | No | Yes |
| View approved model answers and marking information | No | Yes | Yes |
| Create, edit, publish, unpublish, or archive questions | No | No | Yes |
| View or edit authoring metadata for any question, including model answer, marks, draft state, and extracted content | No | Read approved content only | Yes |
| View original uploaded image or free-form handwriting for a question | No | No | Yes |
| Create or update own answer submission before review | Yes | No | No |
| View own answer submissions | Yes | No | No |
| View a student's answer submission | Own only | All students | All students |
| View original uploaded/handwritten input for an answer submission | Own only | All students | All students |
| Create a review for a student answer submission | No | Yes | Yes |
| View or edit own review of a student answer submission | No | Yes | Yes |
| View all student answer submissions | No | Yes | Yes |
| View own overall and topic performance | Yes | No | No |
| View all students' overall and topic performance | No | Yes | Yes |

## Current enforcement

The current API uses a signed JWT carrying user ID and one of two roles: `student` or `teacher`. `verifyToken` authenticates protected routes and `verifyRole` enforces teacher-only or student-only endpoints. The planned tuition-centre model requires `tutor` and `content_manager` roles, with `content_manager` inheriting every tutor permission; these roles are not yet implemented.

Students are additionally checked against the submission owner when requesting a single submission or attempting an update.

Original uploaded images and handwriting are part of a submission. They must inherit the same access control as the submission and must not be exposed by a public file URL.

## Rules to decide before classroom features

- Whether tutors should ultimately see all students or only students assigned to them.
- Whether administrators are needed for account, content-manager assignment, and safeguarding management.
- What happens to submissions when a question is unpublished or deleted.
