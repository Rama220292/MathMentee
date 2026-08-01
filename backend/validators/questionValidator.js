const Joi = require("joi");

const MAX_QUESTION_IMAGE_SIZE = 10 * 1024 * 1024;
const QUESTION_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const stepSchema = Joi.object({
  content: Joi.string().required(),
  marks: Joi.number().min(1).required()
});

const createQuestionSchema = Joi.object({
  title: Joi.string().required(),

  question_text: Joi.string().required(),

  topic: Joi.string().valid("Algebra", "Geometry").required(),

  level: Joi.string()
    .valid("Sec1", "Sec2", "Sec3", "Sec4")
    .required(),

  model_answer: Joi.object({
    final_answer: Joi.string().required(),
    steps: Joi.array().items(stepSchema).required()
  }).required(),

  final_answer_marks: Joi.number().min(0).required(),

  isPublished: Joi.boolean().optional()
});

const updateQuestionSchema = createQuestionSchema.fork(
  Object.keys(createQuestionSchema.describe().keys),
  (field) => field.optional()
);

const questionImageUploadRequestSchema = Joi.object({
  filename: Joi.string().trim().min(1).max(255).required(),
  contentType: Joi.string().valid(...QUESTION_IMAGE_TYPES).required(),
  size: Joi.number().integer().min(1).max(MAX_QUESTION_IMAGE_SIZE).required()
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  questionImageUploadRequestSchema
};
