const assert = require("node:assert/strict");
const test = require("node:test");

const submissionModelPath = require.resolve("../models/Submission");
const questionModelPath = require.resolve("../models/Question");
const questionVersionModelPath = require.resolve("../models/QuestionVersion");
const uploadModelPath = require.resolve("../models/SubmissionImageUpload");
const aiServicePath = require.resolve("../services/aiService");
const extractionServicePath = require.resolve("../services/submissionExtractionService");
const storageServicePath = require.resolve("../services/submissionImageStorageService");
const versionServicePath = require.resolve("../services/questionVersionService");
const controllerPath = require.resolve("../controllers/submissionController");

const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; }
});

test("grades only the student-confirmed handwriting transcript", async () => {
  const studentId = "507f1f77bcf86cd799439011";
  const submission = {
    _id: "507f191e810c19729de860ed",
    studentId: { toString: () => studentId },
    questionId: "507f191e810c19729de860eb",
    question_snapshot: {
      version_number: 1,
      title: "Equation",
      question_text: "Solve 2x = 8",
      topic: "Algebra",
      level: "Sec1",
      model_answer: { final_answer: "x = 4", steps: [{ content: "Divide by 2", marks: 1 }] },
      final_answer_marks: 1,
      total_marks: 2
    },
    input_method: "handwriting",
    processing_status: "extracted",
    review_status: "pending",
    extracted_answer: {
      raw_text: "machine text",
      extracted_at: new Date(),
      steps: ["incorrect OCR"],
      final_answer: "x = 9"
    },
    async save() {}
  };
  let gradedAnswer;
  let failGrading = true;

  require.cache[submissionModelPath] = {
    exports: { findOne: async () => submission }
  };
  require.cache[questionModelPath] = { exports: {} };
  require.cache[questionVersionModelPath] = { exports: {} };
  require.cache[uploadModelPath] = { exports: {} };
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
  require.cache[aiServicePath] = {
    exports: async (answer) => {
      if (failGrading) throw new Error("Temporary grading failure");
      gradedAnswer = answer;
      return {
        score: 2,
        feedback: "Correct",
        marks_breakdown: [{
          criterion: "Method",
          marks_awarded: 2,
          marks_available: 2,
          evidence: "x = 4",
          feedback: "Correct"
        }]
      };
    }
  };
  delete require.cache[controllerPath];
  const { updateTranscript, confirmTranscriptAndGrade } = require(controllerPath);

  const transcriptResponse = response();
  await updateTranscript({
    params: { id: submission._id },
    user: { id: studentId },
    body: { steps: ["2x = 8"], final_answer: "x = 4" }
  }, transcriptResponse);
  assert.equal(transcriptResponse.statusCode, 200);

  const gradeResponse = response();
  const request = {
    params: { id: submission._id },
    user: { id: studentId, role: "student" }
  };
  await confirmTranscriptAndGrade(request, gradeResponse);
  assert.equal(gradeResponse.statusCode, 502);
  assert.equal(submission.processing_status, "grading_error");

  const retryResponse = response();
  await updateTranscript({ ...request, body: { steps: ["2x = 8"], final_answer: "x = 4" } }, retryResponse);
  assert.equal(retryResponse.statusCode, 200);
  assert.equal(submission.processing_status, "extracted");
  assert.equal(submission.confirmed_answer.confirmed_at, undefined);
  failGrading = false;
  await confirmTranscriptAndGrade({
    params: { id: submission._id },
    user: { id: studentId, role: "student" }
  }, response());

  assert.deepEqual(gradedAnswer, { steps: ["2x = 8"], final_answer: "x = 4" });
  assert.equal(submission.ai_score, 2);
  assert.equal(submission.review_status, "ai_graded");
  assert.equal(submission.processing_status, "ai_graded");
  assert.ok(submission.confirmed_answer.confirmed_at instanceof Date);
  assert.equal("final_score" in submission, false);

  for (const state of ["grading", "ai_graded", "reviewed", "uploaded", "extracting"]) {
    submission.processing_status = state;
    const rejected = response();
    await updateTranscript({ ...request, body: { steps: ["changed"], final_answer: "changed" } }, rejected);
    assert.equal(rejected.statusCode, 409, state);
    assert.equal(submission.confirmed_answer.final_answer, "x = 4");
  }

  submission.processing_status = "grading_error";
  submission.review_status = "reviewed";
  const reviewed = response();
  await updateTranscript({ ...request, body: {} }, reviewed);
  assert.equal(reviewed.statusCode, 409);

  submission.review_status = "pending";
  submission.extracted_answer = undefined;
  const extractionFailure = response();
  await updateTranscript({ ...request, body: {} }, extractionFailure);
  assert.equal(extractionFailure.statusCode, 409);
});
