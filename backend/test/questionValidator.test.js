const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createQuestionSchema,
  questionImageUploadRequestSchema,
  questionPublicationSchema,
  questionArchiveSchema
} = require("../validators/questionValidator");

test("accepts supported question image upload metadata", () => {
  const payload = {
    filename: "question.png",
    contentType: "image/png",
    size: 1234
  };

  const { error, value } = questionImageUploadRequestSchema.validate(payload);

  assert.equal(error, undefined);
  assert.deepEqual(value, payload);
});

test("rejects unsupported question image content types", () => {
  const { error } = questionImageUploadRequestSchema.validate({
    filename: "question.gif",
    contentType: "image/gif",
    size: 1234
  });

  assert.match(error.message, /contentType/);
});

test("requires an explicit boolean publication state", () => {
  assert.equal(
    questionPublicationSchema.validate({ isPublished: true }).error,
    undefined
  );
  assert.ok(questionPublicationSchema.validate({}).error);
  assert.ok(
    questionPublicationSchema.validate({ isPublished: "yes" }).error
  );
});

test("question creation cannot publish as a side effect", () => {
  const { error } = createQuestionSchema.validate({
    title: "Linear equation",
    question_text: "Solve 2x = 6.",
    topic: "Algebra",
    level: "Sec1",
    model_answer: {
      final_answer: "x = 3",
      steps: [{ content: "Divide by 2", marks: 1 }]
    },
    final_answer_marks: 1,
    isPublished: true
  });

  assert.match(error.message, /isPublished/);
});

test("requires an explicit boolean archive state", () => {
  assert.equal(
    questionArchiveSchema.validate({ archived: true }).error,
    undefined
  );
  assert.ok(questionArchiveSchema.validate({}).error);
});
