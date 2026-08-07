const { randomUUID } = require("node:crypto");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const UPLOAD_URL_TTL_SECONDS = 5 * 60;
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
  { userId, contentType, size },
  dependencies = {}
) => {
  const config = dependencies.config || getStorageConfig();
  const createId = dependencies.createId || randomUUID;
  const presign = dependencies.presign || getSignedUrl;
  const now = dependencies.now || (() => Date.now());
  const client = dependencies.client || new S3Client({ region: config.region });
  const extension = IMAGE_EXTENSIONS[contentType];
  const objectKey = `question-source-images/${userId}/${createId()}.${extension}`;
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

module.exports = {
  UPLOAD_URL_TTL_SECONDS,
  createQuestionImageUpload,
  getStorageConfig
};
