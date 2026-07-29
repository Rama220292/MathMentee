# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 344 nodes · 490 edges · 20 communities
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `32b8d596`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13

## God Nodes (most connected - your core abstractions)
1. `Submission` - 8 edges
2. `QuestionsForm()` - 6 edges
3. `scripts` - 5 edges
4. `getQuestionById()` - 5 edges
5. `deleteQuestion()` - 5 edges
6. `getSubmissionById()` - 5 edges
7. `User` - 4 edges
8. `createSubmission()` - 4 edges
9. `updateSubmission()` - 4 edges
10. `Navbar()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `signup()` --calls--> `sendVerificationEmail()`  [EXTRACTED]
  backend/controllers/authController.js → backend/services/emailService.js
- `LoginForm()` --calls--> `login()`  [EXTRACTED]
  frontend/src/components/auth/LoginForm.jsx → frontend/src/services/authService.js
- `SignupForm()` --calls--> `signup()`  [EXTRACTED]
  frontend/src/components/auth/SignupForm.jsx → frontend/src/services/authService.js
- `QuestionCard()` --calls--> `deleteQuestion()`  [EXTRACTED]
  frontend/src/components/questions/QuestionCard.jsx → frontend/src/services/questionService.js
- `QuestionsForm()` --calls--> `createQuestion()`  [EXTRACTED]
  frontend/src/components/questions/QuestionsForm.jsx → frontend/src/services/questionService.js

## Import Cycles
- None detected.

## Communities (20 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (21): App(), LoadingScreen(), Navbar(), ProtectedRoute(), RoleGuard(), AIScorePanel(), FinalScoreSummary(), MarkingBreakdown() (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (24): Navbar(), EditQuestionModal(), QuestionCard(), QuestionFilters(), QuestionsForm(), schema, stepSchema, StepInputList() (+16 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (29): createSubmission(), { createSubmissionSchema, updateSubmissionSchema, reviewSubmissionSchema }, getAllSubmissions(), getMySubmissions(), getPendingSubmissions(), getSubmissionById(), gradeAnswer, gradeWithAI (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (32): autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, autoprefixer, eslint (+24 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (29): dependencies, axios, bcrypt, cors, dotenv, express, joi, jsonwebtoken (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (29): css, dom, dependencies, axios, css, dom, @hookform/resolvers, lucide-react (+21 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (19): mongoose, authController, express, router, { signupSchema, loginSchema }, validate, app, authRoutes (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (15): jwt, { createQuestionSchema, updateQuestionSchema }, express, { objectIdSchema }, questionController, router, validate, verifyRole (+7 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (10): ReviewCard(), ReviewSubmissionForm(), StudentSubmissionCard(), SubmissionsFilters(), StudentSubmissionsPage(), SubmissionsPage(), api, getMySubmissions() (+2 more)

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (10): LoginForm(), schema, schema, SignupForm(), LoginPage(), SignupPage(), VerifyPage(), login() (+2 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (13): bcrypt, crypto, jwt, login(), { sendVerificationEmail }, signup(), User, verifyEmail() (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.14
Nodes (5): mongoose, Question, mongoose, questionSchema, stepSchema

### Community 12 - "Community 12"
Cohesion: 0.17
Nodes (11): @tailwindcss/vite, tailwindcss, graphify, graphifyy, dependencies, graphify, graphifyy, tailwindcss (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.83
Nodes (3): gradeAnswer(), isEquivalent(), normalize()

## Knowledge Gaps
- **110 isolated node(s):** `mongoose`, `bcrypt`, `jwt`, `crypto`, `{ sendVerificationEmail }` (+105 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 5` to `Community 3`, `Community 4`, `Community 12`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 3` to `Community 12`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `mongoose`, `bcrypt`, `jwt` to the rest of the system?**
  _110 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09291521486643438 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.10241820768136557 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.08739495798319327 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._