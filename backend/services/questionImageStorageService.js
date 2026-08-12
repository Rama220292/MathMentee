const { randomUUID } = require("node:crypto");
const {
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const UPLOAD_URL_TTL_SECONDS = 5 * 60;
const MAX_QUESTION_IMAGE_SIZE = 10 * 1024 * 1024;
const IMAGE_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

const getStorageConfig = () => {
  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_S3_QUESTION_ASSETS_BUCKET;

  if (!region || !bucket) {
    const error = new Error("Question image storage is not configured");
    error.code = "STORAGE_NOT_CONFIGURED";
    throw error;
  }

  return { region, bucket };
};

const createQuestionImageUpload = async (
  { userId, uploadId, contentType, size },
  dependencies = {}
) => {
  const config = dependencies.config || getStorageConfig();
  const createId = dependencies.createId || randomUUID;
  const presign = dependencies.presign || getSignedUrl;
  const now = dependencies.now || (() => Date.now());
  const client = dependencies.client || new S3Client({ region: config.region });
  const extension = IMAGE_EXTENSIONS[contentType];
  const objectKey = `question-source-images/${userId}/${uploadId || createId()}.${extension}`;
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ContentType: contentType,
    ContentLength: size
  });
  const uploadUrl = await presign(client, command, {
    expiresIn: UPLOAD_URL_TTL_SECONDS
  });

  return {
    uploadUrl,
    objectKey,
    expiresAt: new Date(now() + UPLOAD_URL_TTL_SECONDS * 1000).toISOString(),
    headers: {
      "Content-Type": contentType
    }
  };
};

const verifyQuestionImageUpload = async (
  { objectKey, expectedContentType, expectedSize },
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
      const notFoundError = new Error("Uploaded question image was not found");
      notFoundError.code = "UPLOAD_NOT_FOUND";
      throw notFoundError;
    }

    const storageError = new Error("Could not verify uploaded question image");
    storageError.code = "STORAGE_UNAVAILABLE";
    throw storageError;
  }

  const contentType = metadata.ContentType;
  const size = metadata.ContentLength;

  if (
    contentType !== expectedContentType ||
    !IMAGE_EXTENSIONS[contentType] ||
    size !== expectedSize ||
    size < 1 ||
    size > MAX_QUESTION_IMAGE_SIZE
  ) {
    const invalidError = new Error("Uploaded question image metadata does not match the upload request");
    invalidError.code = "UPLOAD_METADATA_MISMATCH";
    throw invalidError;
  }

  return {
    contentType,
    size,
    etag: metadata.ETag || null,
    lastModified: metadata.LastModified || null
  };
};

const getQuestionImage = async ({ objectKey }, dependencies = {}) => {
  const config = dependencies.config || getStorageConfig();
  const client = dependencies.client || new S3Client({ region: config.region });
  const get = dependencies.get || ((s3Client, command) => s3Client.send(command));

  try {
    const object = await get(client, new GetObjectCommand({
      Bucket: config.bucket,
      Key: objectKey
    }));
    const bytes = await object.Body.transformToByteArray();
    return {
      bytes: Buffer.from(bytes),
      contentType: object.ContentType
    };
  } catch (error) {
    const storageError = new Error("Could not read uploaded question image");
    storageError.code = "STORAGE_UNAVAILABLE";
    throw storageError;
  }
};

module.exports = {
  MAX_QUESTION_IMAGE_SIZE,
  UPLOAD_URL_TTL_SECONDS,
  createQuestionImageUpload,
  getQuestionImage,
  getStorageConfig,
  verifyQuestionImageUpload
};
