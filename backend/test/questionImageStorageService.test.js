const assert = require("node:assert/strict");
const test = require("node:test");

const {
  UPLOAD_URL_TTL_SECONDS,
  createQuestionImageUpload,
  getStorageConfig
} = require("../services/questionImageStorageService");

test("creates a user-scoped, five-minute image upload", async () => {
  let signedCommand;
  let signedOptions;
  const now = Date.parse("2026-08-06T02:00:00.000Z");

  const result = await createQuestionImageUpload(
    {
      userId: "507f1f77bcf86cd799439011",
      contentType: "image/png",
      size: 1234
    },
    {
      config: { region: "ap-southeast-1", bucket: "private-assets" },
      client: {},
      createId: () => "upload-id",
      now: () => now,
      presign: async (_client, command, options) => {
        signedCommand = command;
        signedOptions = options;
        return "https://signed-upload.example";
      }
    }
  );

  assert.equal(result.uploadUrl, "https://signed-upload.example");
  assert.equal(
    result.objectKey,
    "question-source-images/507f1f77bcf86cd799439011/upload-id.png"
  );
  assert.equal(result.expiresAt, "2026-08-06T02:05:00.000Z");
  assert.deepEqual(result.headers, { "Content-Type": "image/png" });
  assert.equal(signedOptions.expiresIn, UPLOAD_URL_TTL_SECONDS);
  assert.deepEqual(signedCommand.input, {
    Bucket: "private-assets",
    Key: result.objectKey,
    ContentType: "image/png",
    ContentLength: 1234
  });
});

test("fails clearly when S3 configuration is missing", () => {
  const previousRegion = process.env.AWS_REGION;
  const previousBucket = process.env.AWS_S3_QUESTION_ASSETS_BUCKET;
  delete process.env.AWS_REGION;
  delete process.env.AWS_S3_QUESTION_ASSETS_BUCKET;

  try {
    assert.throws(getStorageConfig, {
      code: "STORAGE_NOT_CONFIGURED",
      message: "Question image storage is not configured"
    });
  } finally {
    if (previousRegion === undefined) delete process.env.AWS_REGION;
    else process.env.AWS_REGION = previousRegion;
    if (previousBucket === undefined) delete process.env.AWS_S3_QUESTION_ASSETS_BUCKET;
    else process.env.AWS_S3_QUESTION_ASSETS_BUCKET = previousBucket;
  }
});
