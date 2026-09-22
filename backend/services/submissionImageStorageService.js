const { randomUUID } = require("node:crypto");
const {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const UPLOAD_URL_TTL_SECONDS = 5 * 60;
const READ_URL_TTL_SECONDS = 5 * 60;
const MAX_SUBMISSION_IMAGE_SIZE = 10 * 1024 * 1024;

const getStorageConfig = () => {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_SUBMISSION_ASSETS_BUCKET
    || process.env.AWS_S3_QUESTION_ASSETS_BUCKET;

  if (!region || !bucket) {
    const error = new Error("Submission image storage is not configured");
    error.code = "STORAGE_NOT_CONFIGURED";
    throw error;
  }

  return { region, bucket };
};

const createSubmissionImageUpload = async (
  { studentId, uploadId, size },
  dependencies = {}
) => {
  const config = dependencies.config || getStorageConfig();
  const createId = dependencies.createId || randomUUID;
  const presign = dependencies.presign || getSignedUrl;
  const now = dependencies.now || (() => Date.now());
  const client = dependencies.client || new S3Client({ region: config.region });
  const objectKey = `submission-source-images/${studentId}/${uploadId || createId()}.png`;
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ContentType: "image/png",
    ContentLength: size
  });

  return {
    uploadUrl: await presign(client, command, { expiresIn: UPLOAD_URL_TTL_SECONDS }),
    objectKey,
    expiresAt: new Date(now() + UPLOAD_URL_TTL_SECONDS * 1000).toISOString(),
    headers: { "Content-Type": "image/png" }
  };
};

const verifySubmissionImageUpload = async (
  { objectKey, expectedSize },
  dependencies = {}
) => {
  const config = dependencies.config || getStorageConfig();
  const client = dependencies.client || new S3Client({ region: config.region });
  const head = dependencies.head || ((s3Client, command) => s3Client.send(command));
  let metadata;

  try {
    metadata = await head(client, new HeadObjectCommand({
      Bucket: config.bucket,
      Key: objectKey
    }));
  } catch (error) {
    const status = error.$metadata?.httpStatusCode;
    if (status === 404 || error.name === "NotFound" || error.name === "NoSuchKey") {
      const notFound = new Error("Uploaded handwriting image was not found");
      notFound.code = "UPLOAD_NOT_FOUND";
      throw notFound;
    }
    const unavailable = new Error("Could not verify uploaded handwriting image");
    unavailable.code = "STORAGE_UNAVAILABLE";
    throw unavailable;
  }

  if (
    metadata.ContentType !== "image/png"
    || metadata.ContentLength !== expectedSize
    || expectedSize < 1
    || expectedSize > MAX_SUBMISSION_IMAGE_SIZE
  ) {
    const invalid = new Error("Uploaded handwriting image metadata does not match the upload request");
    invalid.code = "UPLOAD_METADATA_MISMATCH";
    throw invalid;
  }

  return {
    contentType: metadata.ContentType,
    size: metadata.ContentLength,
    etag: metadata.ETag || null,
    lastModified: metadata.LastModified || null
  };
};

const getSubmissionImage = async ({ objectKey }, dependencies = {}) => {
  const config = dependencies.config || getStorageConfig();
  const client = dependencies.client || new S3Client({ region: config.region });
  const get = dependencies.get || ((s3Client, command) => s3Client.send(command));

  try {
    const object = await get(client, new GetObjectCommand({
      Bucket: config.bucket,
      Key: objectKey
    }));
    const bytes = await object.Body.transformToByteArray();
    return { bytes: Buffer.from(bytes), contentType: object.ContentType || "image/png" };
  } catch {
    const unavailable = new Error("Could not read uploaded handwriting image");
    unavailable.code = "STORAGE_UNAVAILABLE";
    throw unavailable;
  }
};

const createSubmissionImageReadUrl = async ({ objectKey }, dependencies = {}) => {
  const config = dependencies.config || getStorageConfig();
  const client = dependencies.client || new S3Client({ region: config.region });
  const presign = dependencies.presign || getSignedUrl;
  return presign(client, new GetObjectCommand({
    Bucket: config.bucket,
    Key: objectKey
  }), { expiresIn: READ_URL_TTL_SECONDS });
};

module.exports = {
  MAX_SUBMISSION_IMAGE_SIZE,
  READ_URL_TTL_SECONDS,
  UPLOAD_URL_TTL_SECONDS,
  createSubmissionImageReadUrl,
  createSubmissionImageUpload,
  getStorageConfig,
  getSubmissionImage,
  verifySubmissionImageUpload
};
