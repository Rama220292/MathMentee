# MathMentee

MathMentee is a web application for structured secondary-school mathematics practice for students in Singapore. Students submit their working and final answer, receive automated feedback, and can have their work reviewed by a teacher. Teachers create questions, define marking schemes, and review student submissions.

> Project status: early MVP. The core question, submission, automated-marking, and teacher-review workflows exist; dashboards, settings, and feedback areas are still placeholders.

## The problem

### For students

First, not every student can afford private mathematics tuition.

Second, access to qualified tutors is limited by their availability.

### For tutors

First, teaching workload scales with class size, making it harder to preserve teaching quality as a class grows.

Second, providing personalised feedback creates a substantial cognitive workload, making it difficult to give every student the attention they need in a large class.

## Current MVP capabilities

### Students

- Create an account, verify their email address, and sign in.
- Browse published questions by topic and school level.
- Submit working steps and a final answer.
- Receive deterministic step/final-answer marks and AI-generated feedback.
- View previous submissions and their review status.

### Teachers

- Create, edit, publish, and delete questions.
- Define a model answer, mark allocation for each step, and final-answer marks.
- View and filter student submissions.
- Review a submission and override its score and feedback.

### Current content scope

- Topics: Algebra and Geometry.
- Levels: Singapore Secondary 1 through Secondary 4 (Sec 1–4).

## How marking currently works

When a student submits an answer, the application performs two independent checks:

1. A deterministic matcher compares the submitted final answer and each working step with the teacher's model answer. It normalizes whitespace and multiplication symbols and supports reversed equations (for example, `x = 2` and `2 = x`). This result currently supplies the submission's initial final score.
2. An AI model generates a separate score and constructive feedback based on the question, model answer, and student response.

A teacher can review a submission. Their score and feedback then become the final score and feedback shown for that reviewed submission.

This matcher is deliberately simple at present; it is not a general symbolic mathematics engine and does not yet evaluate algebraic equivalence beyond the rules above.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, React Hook Form, Zod |
| Styling | Tailwind CSS utility classes |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Authentication | JWT and bcrypt |
| Validation | Joi (API) and Zod (forms) |
| AI feedback | OpenAI Responses API |
| Email verification | Nodemailer via Gmail SMTP |
| Deployment | Netlify frontend and Render API |

## Repository structure

```text
MathMentee/
├── frontend/          # React client application
├── backend/           # Express API, data models, and services
├── docs/              # Product and technical planning documents (in progress)
├── netlify.toml       # Netlify build and SPA redirect configuration
└── render.yaml        # Render API service configuration
```

## Local development

### Prerequisites

- Node.js 22 or later
- A MongoDB database (MongoDB Atlas is supported)
- An OpenAI API key for AI feedback
- A Gmail account and app password for verification emails

### 1. Configure the API

```bash
cd backend
npm install
cp .env.example .env
```

Set the required values in `backend/.env`, then start the API:

```bash
npm start
```

The API runs on `http://localhost:5000` by default. Confirm it with `GET /health`.

### 2. Configure the frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_BACK_END_SERVER_URL` in `frontend/.env` to the API base URL used by your environment. The Vite development server will display the local site URL.

### Environment variables

The API uses these variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | API port; defaults to `5000` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `OPENAI_API_KEY` | Server-side OpenAI API key |
| `EMAIL_USER` | Gmail address for verification email |
| `EMAIL_PASS` | Gmail app password |
| `FRONTEND_URL` | Frontend origin used in verification links |
| `CORS_ORIGIN` | Allowed frontend origin(s), comma-separated if needed |

The frontend uses:

| Variable | Purpose |
| --- | --- |
| `VITE_BACK_END_SERVER_URL` | API base URL |

Do not commit `.env` files or expose `OPENAI_API_KEY` in frontend environment variables.

## Deployment

The repository includes deployment configuration for a Render API and a Netlify React site.

1. Create a Render Blueprint from this repository. `render.yaml` creates the `mathmentee-api` service.
2. In Render, provide `MONGO_URI`, `OPENAI_API_KEY`, `EMAIL_USER`, `EMAIL_PASS`, `FRONTEND_URL`, and `CORS_ORIGIN`. Render generates `JWT_SECRET`.
3. Import the same repository into Netlify. `netlify.toml` supplies the frontend build settings and SPA redirect.
4. In Netlify, set `VITE_BACK_END_SERVER_URL` to the deployed Render API URL.
5. Set `FRONTEND_URL` and `CORS_ORIGIN` in Render to the production Netlify URL, then redeploy the API.

After deployment, the API health check is available at `/health` and returns `{ "status": "ok" }`.

## Product planning

The next phase of the project is to document and validate the product and technical direction before expanding features. Planning documents will live in `docs/`:

- `requirements.md` — product goals, scope, constraints, and success measures.
- `user-stories.md` — prioritised student, teacher, and system stories with acceptance criteria.
- `grading-design.md` — marking rules, score authority, AI role, and review behaviour.
- `roles-and-permissions.md` — authorization rules for students, teachers, and system actions.
- `database-schema.md` — data entities, relationships, lifecycle rules, and deferred concepts.
- `api-specification.md` — API contracts, authentication, validation, and error behaviour.
- `roadmap.md` — phased outcomes and delivery priorities.
- `product-decisions.md` — concise records of important product and architectural decisions.
- `ui-flows.md` — key user journeys and screen-level flows.

## Near-term direction

MathMentee's target operating model is a tuition-centre product: content managers govern a shared question bank, tutors review and support students, and all students can access published questions. The current MVP still uses a single `teacher` role, so the next planning and implementation work will evolve the data model and permissions toward these distinct roles.
