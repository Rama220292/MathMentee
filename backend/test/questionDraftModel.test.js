const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");

const Question = require("../models/Question");

test("an uploaded image can create an unpublished partial question draft", async () => {
  const question = new Question({
    created_by: new mongoose.Types.ObjectId(),
    authoring_status: "uploaded",
    isPublished: false,
    source_asset: {
      object_key: "question-source-images/user/upload.png",
      content_type: "image/png",
      size: 1234,
      confirmed_at: new Date("2026-08-06T02:01:00.000Z")
    }
  });

  await question.validate();

  assert.equal(question.authoring_status, "uploaded");
  assert.equal(question.isPublished, false);
  assert.equal(question.source_asset.content_type, "image/png");
});

test("a ready question still requires completed authoring content", async () => {
  const question = new Question({
    created_by: new mongoose.Types.ObjectId(),
    authoring_status: "ready",
    isPublished: false
  });

  await assert.rejects(question.validate(), (error) => {
    assert.equal(error.name, "ValidationError");
    assert.ok(error.errors.title);
    assert.ok(error.errors.question_text);
    assert.ok(error.errors.topic);
    assert.ok(error.errors.level);
    assert.ok(error.errors["model_answer.final_answer"]);
    return true;
  });
});
