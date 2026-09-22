const assert = require("node:assert/strict");
const test = require("node:test");

const {
  UPLOAD_URL_TTL_SECONDS,
  createSubmissionImageUpload,
  verifySubmissionImageUpload
} = require("../services/submissionImageStorageService");

test("creates a student-scoped PNG upload", async () => {
  let signedCommand;
  const now = Date.parse("2026-09-17T12:00:00.000Z");
  const result = await createSubmissionImageUpload(
    { studentId: "student-id", uploadId: "upload-id", size: 4321 },
    {
      config: { region: "ap-southeast-1", bucket: "private-submissions" },
      client: {},
      now: () => now,
      presign: async (_client, command) => {
        signedCommand = command;
        return "https://signed-upload.example";
      }
    }
  );

  assert.equal(result.objectKey, "submission-source-images/student-id/upload-id.png");
  assert.equal(result.expiresAt, "2026-09-17T12:05:00.000Z");
  assert.deepEqual(result.headers, { "Content-Type": "image/png" });
  assert.equal(UPLOAD_URL_TTL_SECONDS, 300);
  assert.deepEqual(signedCommand.input, {
    Bucket: "private-submissions",
    Key: result.objectKey,
    ContentType: "image/png",
    ContentLength: 4321
  });
});

test("verifies a handwriting PNG without downloading it", async () => {
  const result = await verifySubmissionImageUpload(
    { objectKey: "submission-source-images/student/upload.png", expectedSize: 4321 },
    {
      config: { region: "ap-southeast-1", bucket: "private-submissions" },
      client: {},
      head: async () => ({
        ContentType: "image/png",
        ContentLength: 4321,
        ETag: "etag"
      })
    }
  );

  assert.equal(result.contentType, "image/png");
  assert.equal(result.size, 4321);
});

test("rejects mismatched handwriting metadata", async () => {
  await assert.rejects(
    verifySubmissionImageUpload(
      { objectKey: "submission-source-images/student/upload.png", expectedSize: 4321 },
      {
        config: { region: "ap-southeast-1", bucket: "private-submissions" },
        client: {},
        head: async () => ({ ContentType: "image/jpeg", ContentLength: 4321 })
      }
    ),
    { code: "UPLOAD_METADATA_MISMATCH" }
  );
});
