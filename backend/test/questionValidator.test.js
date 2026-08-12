const assert = require("node:assert/strict");
const test = require("node:test");

const {
  questionImageUploadRequestSchema
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
