const assert = require("node:assert/strict");
const test = require("node:test");

const questionModelPath = require.resolve("../models/Question");
const uploadModelPath = require.resolve("../models/QuestionImageUpload");
const storageServicePath = require.resolve("../services/questionImageStorageService");
const extractionServicePath = require.resolve("../services/questionExtractionService");
const controllerPath = require.resolve("../controllers/questionController");

test("stores and returns an extracted answer for review", async () => {
  const question = {
    _id: "507f191e810c19729de860eb",
    created_by: "507f1f77bcf86cd799439011",
    isPublished: false,
    source_asset: { object_key: "private/question.png" },
    async save() {}
  };
  const extracted = {
    title: "Linear equation",
    question_text: "Solve 2x = 6.",
    topic: "Algebra",
    level: "Sec1",
    model_answer: {
      final_answer: "x = 3",
      steps: [{ content: "Divide both sides by 2.", marks: 1 }]
    },
    final_answer_marks: 1,
    confidence: 0.95,
    review_notes: []
  };

  require.cache[questionModelPath] = {
    exports: {
      findOne: () => ({ select: async () => question })
    }
  };
  require.cache[uploadModelPath] = { exports: {} };
  require.cache[storageServicePath] = {
    exports: {
      createQuestionImageUpload: async () => {},
      verifyQuestionImageUpload: async () => {}
    }
  };
  require.cache[extractionServicePath] = {
    exports: { extractQuestionImage: async () => extracted }
  };
  delete require.cache[controllerPath];
  const { extractQuestionDraft } = require(controllerPath);
  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    }
  };

  await extractQuestionDraft({
    params: { id: question._id },
    user: { id: question.created_by }
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(question.authoring_status, "extracted");
  assert.deepEqual(question.model_answer, extracted.model_answer);
  assert.equal(question.final_answer_marks, 1);
  assert.deepEqual(response.body.extractedContent.model_answer, extracted.model_answer);
  assert.equal(response.body.extractedContent.final_answer_marks, 1);
});
