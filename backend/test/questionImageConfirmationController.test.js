const assert = require("node:assert/strict");
const test = require("node:test");

const questionModelPath = require.resolve("../models/Question");
const uploadModelPath = require.resolve("../models/QuestionImageUpload");
const storageServicePath = require.resolve("../services/questionImageStorageService");
const controllerPath = require.resolve("../controllers/questionController");

const ownerId = "507f1f77bcf86cd799439011";
const uploadId = "507f191e810c19729de860ea";
const draftId = "507f191e810c19729de860eb";
const confirmedAt = new Date("2026-08-06T02:01:00.000Z");

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

const loadController = ({ pendingUpload, metadata, onFindUpload, onCreateQuestion }) => {
  const question = {
    _id: draftId,
    authoring_status: "uploaded",
    source_asset: {
      content_type: "image/png",
      size: 1234,
      confirmed_at: confirmedAt
    }
  };

  require.cache[questionModelPath] = {
    exports: {
      create: async (data) => {
        onCreateQuestion?.(data);
        return question;
      },
      findById: () => ({ select: async () => question })
    }
  };
  require.cache[uploadModelPath] = {
    exports: {
      create: async () => {},
      findOne: async (filter) => {
        onFindUpload?.(filter);
        return pendingUpload;
      }
    }
  };
  require.cache[storageServicePath] = {
    exports: {
      createQuestionImageUpload: async () => {},
      verifyQuestionImageUpload: async () => metadata
    }
  };
  delete require.cache[controllerPath];
  return require(controllerPath);
};

test("confirms an owner-scoped upload and creates an unpublished draft", async () => {
  let findFilter;
  let createdQuestion;
  let saved = false;
  const pendingUpload = {
    object_key: `question-source-images/${ownerId}/${uploadId}.png`,
    content_type: "image/png",
    size: 1234,
    expires_at: new Date(Date.now() + 60_000),
    status: "pending",
    async save() {
      saved = true;
    }
  };
  const controller = loadController({
    pendingUpload,
    metadata: {
      contentType: "image/png",
      size: 1234,
      etag: "etag-value",
      lastModified: new Date("2026-08-06T02:00:30.000Z")
    },
    onFindUpload: (filter) => { findFilter = filter; },
    onCreateQuestion: (data) => { createdQuestion = data; }
  });
  const response = createResponse();

  await controller.confirmQuestionImageUpload(
    { user: { id: ownerId }, body: { uploadId } },
    response
  );

  assert.deepEqual(findFilter, { _id: uploadId, created_by: ownerId });
  assert.equal(createdQuestion.created_by, ownerId);
  assert.equal(createdQuestion.authoring_status, "uploaded");
  assert.equal(createdQuestion.isPublished, false);
  assert.equal(createdQuestion.source_asset.object_key, pendingUpload.object_key);
  assert.equal(saved, true);
  assert.equal(pendingUpload.status, "confirmed");
  assert.equal(pendingUpload.question, draftId);
  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.body.sourceAsset, {
    contentType: "image/png",
    size: 1234
  });
  assert.equal("objectKey" in response.body.sourceAsset, false);
});

test("rejects an expired pending upload before creating a draft", async () => {
  let createdQuestion = false;
  const controller = loadController({
    pendingUpload: {
      expires_at: new Date(Date.now() - 60_000),
      status: "pending"
    },
    metadata: null,
    onCreateQuestion: () => { createdQuestion = true; }
  });
  const response = createResponse();

  await controller.confirmQuestionImageUpload(
    { user: { id: ownerId }, body: { uploadId } },
    response
  );

  assert.equal(response.statusCode, 410);
  assert.deepEqual(response.body, { err: "Question image upload request expired" });
  assert.equal(createdQuestion, false);
});
