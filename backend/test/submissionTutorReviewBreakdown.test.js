const assert = require("node:assert/strict");
const test = require("node:test");

const submissionModelPath = require.resolve("../models/Submission");
const questionModelPath = require.resolve("../models/Question");
const questionVersionModelPath = require.resolve("../models/QuestionVersion");
const uploadModelPath = require.resolve("../models/SubmissionImageUpload");
const aiServicePath = require.resolve("../services/aiService");
const extractionServicePath = require.resolve("../services/submissionExtractionService");
const storageServicePath = require.resolve("../services/submissionImageStorageService");
const userModelPath = require.resolve("../models/User");
const versionServicePath = require.resolve("../services/questionVersionService");
const controllerPath = require.resolve("../controllers/submissionController");

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; }
});

test("tutor review stores an edited marks breakdown and validates the final score", async () => {
  const submission = {
    _id: "507f191e810c19729de860ed",
    studentId: "507f1f77bcf86cd799439011",
    questionId: "507f191e810c19729de860eb",
    question_snapshot: {
      total_marks: 3
    },
    review_status: "ai_graded",
    marks_breakdown: [
      { criterion: "Step 1", marks_awarded: 1, marks_available: 1, evidence: "2x = 6", feedback: "Correct" },
      { criterion: "Final answer", marks_awarded: 1, marks_available: 2, evidence: "x = 3", feedback: "Incomplete" }
    ],
    async save() {
      this.saved = true;
    }
  };

  require.cache[submissionModelPath] = { exports: { findById: async () => submission } };
  require.cache[questionModelPath] = { exports: {} };
  require.cache[questionVersionModelPath] = { exports: {} };
  require.cache[uploadModelPath] = { exports: {} };
  require.cache[userModelPath] = { exports: { exists: async () => true } };
  require.cache[aiServicePath] = { exports: async () => ({}) };
  require.cache[extractionServicePath] = { exports: { extractSubmissionImage: async () => ({}) } };
  require.cache[storageServicePath] = {
    exports: {
      createSubmissionImageReadUrl: async () => "",
      createSubmissionImageUpload: async () => ({}),
      verifySubmissionImageUpload: async () => ({})
    }
  };
  require.cache[versionServicePath] = {
    exports: { createQuestionVersion: async () => ({}), snapshotFromVersion: () => ({}) }
  };
  delete require.cache[controllerPath];
  const { reviewSubmission } = require(controllerPath);

  const mismatch = response();
  await reviewSubmission({
    params: { id: submission._id },
    user: { id: "507f191e810c19729de860ef", role: "teacher" },
    body: {
      tutor_score: 3,
      tutor_feedback: "Adjusted",
      tutor_marks_breakdown: [
        { criterion: "Step 1", marks_awarded: 1, marks_available: 1, evidence: "", feedback: "" },
        { criterion: "Final answer", marks_awarded: 1, marks_available: 2, evidence: "", feedback: "" }
      ]
    }
  }, mismatch);

  assert.equal(mismatch.statusCode, 400);
  assert.match(mismatch.body.err, /sum of reviewed marks/);

  const reviewed = response();
  await reviewSubmission({
    params: { id: submission._id },
    user: { id: "507f191e810c19729de860ef", role: "teacher" },
    body: {
      tutor_score: 2,
      tutor_feedback: "One mark lost for final-answer clarity.",
      tutor_marks_breakdown: [
        { criterion: "Step 1", marks_awarded: 1, marks_available: 1, evidence: "2x = 6", feedback: "Correct step." },
        { criterion: "Final answer", marks_awarded: 1, marks_available: 2, evidence: "x = 3", feedback: "Accept partially." }
      ]
    }
  }, reviewed);

  assert.equal(reviewed.statusCode, 200);
  assert.equal(submission.saved, true);
  assert.equal(submission.review_status, "reviewed");
  assert.equal(submission.processing_status, "reviewed");
  assert.equal(submission.tutor_score, 2);
  assert.equal(submission.tutor_marks_breakdown.length, 2);
  assert.equal(submission.tutor_marks_breakdown[1].feedback, "Accept partially.");
});
