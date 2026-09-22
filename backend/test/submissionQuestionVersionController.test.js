const assert = require("node:assert/strict");
const test = require("node:test");

const submissionModelPath = require.resolve("../models/Submission");
const questionModelPath = require.resolve("../models/Question");
const questionVersionModelPath = require.resolve("../models/QuestionVersion");
const aiServicePath = require.resolve("../services/aiService");
const versionServicePath = require.resolve("../services/questionVersionService");
const controllerPath = require.resolve("../controllers/submissionController");

const createResponse = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; }
});

test("pins a new submission to the published question version", async () => {
  const questionId = "507f191e810c19729de860eb";
  const versionId = "507f191e810c19729de860ec";
  const question = {
    _id: questionId,
    isPublished: true,
    archived_at: null,
    published_version: versionId
  };
  const version = {
    _id: versionId,
    version_number: 2,
    title: "Linear equation",
    question_text: "Solve 2x = 6.",
    topic: "Algebra",
    level: "Sec1",
    model_answer: {
      final_answer: "x = 3",
      steps: [{ content: "Divide by 2", marks: 1 }]
    },
    final_answer_marks: 1,
    total_marks: 2
  };
  let submissionPayload;
  let gradedQuestion;

  require.cache[questionModelPath] = { exports: { findById: async () => question } };
  require.cache[questionVersionModelPath] = { exports: { findById: async () => version } };
  require.cache[submissionModelPath] = {
    exports: {
      async create(payload) {
        submissionPayload = payload;
        return payload;
      }
    }
  };
  require.cache[aiServicePath] = {
    exports: async (_answer, gradingVersion) => {
      gradedQuestion = gradingVersion;
      return {
        score: 2,
        feedback: "Correct",
        marks_breakdown: [{
          criterion: "Method",
          marks_awarded: 2,
          marks_available: 2,
          evidence: "x = 3",
          feedback: "Correct"
        }]
      };
    }
  };
  require.cache[versionServicePath] = {
    exports: {
      createQuestionVersion: async () => {
        throw new Error("A published version already exists in this test");
      },
      snapshotFromVersion: (questionVersion) => ({
        version_number: questionVersion.version_number,
        title: questionVersion.title,
        question_text: questionVersion.question_text,
        topic: questionVersion.topic,
        level: questionVersion.level,
        model_answer: questionVersion.model_answer,
        final_answer_marks: questionVersion.final_answer_marks,
        total_marks: questionVersion.total_marks
      })
    }
  };
  delete require.cache[controllerPath];
  const { createSubmission } = require(controllerPath);
  const response = createResponse();

  await createSubmission({
    user: { id: "507f1f77bcf86cd799439011" },
    body: {
      questionId,
      raw_input: "x = 3",
      structured_answer: { final_answer: "x = 3", steps: ["Divide by 2"] }
    }
  }, response);

  assert.equal(response.statusCode, 201);
  assert.equal(gradedQuestion, version);
  assert.equal(submissionPayload.questionVersionId, versionId);
  assert.equal(submissionPayload.question_snapshot.version_number, 2);
  assert.equal(submissionPayload.question_snapshot.question_text, "Solve 2x = 6.");
});

test("rejects new submissions for archived questions", async () => {
  require.cache[questionModelPath] = {
    exports: { findById: async () => ({ isPublished: false, archived_at: new Date() }) }
  };
  delete require.cache[controllerPath];
  const { createSubmission } = require(controllerPath);
  const response = createResponse();

  await createSubmission({
    user: { id: "507f1f77bcf86cd799439011" },
    body: {
      questionId: "507f191e810c19729de860eb",
      raw_input: "x = 3",
      structured_answer: { final_answer: "x = 3", steps: [] }
    }
  }, response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, { err: "Question not found" });
});

test("student submission responses expose AI feedback without marking secrets", async () => {
  const studentId = "507f1f77bcf86cd799439011";
  const submission = {
    _id: "507f191e810c19729de860ed",
    studentId: { _id: studentId, name: "Aisha" },
    questionId: { _id: "507f191e810c19729de860eb" },
    question_snapshot: {
      version_number: 2,
      title: "Linear equation",
      question_text: "Solve 2x = 6.",
      topic: "Algebra",
      level: "Sec1",
      model_answer: {
        final_answer: "x = 3",
        steps: [{ content: "Divide by 2", marks: 1 }]
      },
      final_answer_marks: 1,
      total_marks: 2
    },
    questionVersionId: "507f191e810c19729de860ec",
    structured_answer: { final_answer: "x = 3", steps: ["Divide by 2"] },
    ai_score: 2,
    ai_feedback: "Correct reasoning.",
    marks_breakdown: [{ criterion: "Method", marks_awarded: 2, marks_available: 2 }],
    final_score: 2,
    final_feedback: "Correct",
    review_status: "ai_graded"
  };
  const query = {
    select() { return this; },
    populate() { return this; },
    then(resolve, reject) { return Promise.resolve(submission).then(resolve, reject); }
  };

  require.cache[submissionModelPath] = {
    exports: { findById: () => query }
  };
  delete require.cache[controllerPath];
  const { getSubmissionById } = require(controllerPath);
  const response = createResponse();

  await getSubmissionById({
    params: { id: submission._id },
    user: { id: studentId, role: "student" }
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ai_score, 2);
  assert.equal(response.body.ai_feedback, "Correct reasoning.");
  assert.equal(response.body.questionId.total_marks, 2);
  assert.equal("model_answer" in response.body.questionId, false);
  assert.equal("question_snapshot" in response.body, false);
  assert.equal("questionVersionId" in response.body, false);
  assert.equal("marks_breakdown" in response.body, false);
  assert.equal("final_score" in response.body, false);
});

test("maps a legacy reviewed score to the tutor result without exposing legacy fields", async () => {
  const studentId = "507f1f77bcf86cd799439011";
  const submission = {
    _id: "507f191e810c19729de860ed",
    studentId: { _id: studentId },
    questionId: { _id: "507f191e810c19729de860eb" },
    question_snapshot: {
      version_number: 1,
      title: "Equation",
      question_text: "Solve x = 3",
      topic: "Algebra",
      level: "Sec1",
      model_answer: { final_answer: "x = 3", steps: [] },
      final_answer_marks: 1,
      total_marks: 1
    },
    review_status: "reviewed",
    teacher_score: 1,
    teacher_feedback: "Correct"
  };
  const query = {
    select() { return this; },
    populate() { return this; },
    then(resolve, reject) { return Promise.resolve(submission).then(resolve, reject); }
  };
  require.cache[submissionModelPath] = { exports: { findById: () => query } };
  delete require.cache[controllerPath];
  const { getSubmissionById } = require(controllerPath);
  const result = createResponse();

  await getSubmissionById({
    params: { id: submission._id },
    user: { id: studentId, role: "student" }
  }, result);

  assert.equal(result.body.tutor_score, 1);
  assert.equal(result.body.tutor_feedback, "Correct");
  assert.equal("teacher_score" in result.body, false);
});
