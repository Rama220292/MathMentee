const Joi = require("joi");

// CREATE 
const createSubmissionSchema = Joi.object({
  questionId: Joi.string().required(),

  raw_input: Joi.string().required(),

  structured_answer: Joi.object({
    final_answer: Joi.string().allow("").required(),
    steps: Joi.array().items(Joi.string()).required()
  }).required()
});

// UPDATE (student edits)
const updateSubmissionSchema = Joi.object({
  raw_input: Joi.string().optional(),

  structured_answer: Joi.object({
    final_answer: Joi.string().allow("").required(),
    steps: Joi.array().items(Joi.string()).required()
  }).required()
});


// REVIEW (teacher grading)
const reviewSubmissionSchema = Joi.object({
  tutor_score: Joi.number().min(0).required(),

  tutor_feedback: Joi.string().allow("").required()
});

const submissionImageUploadRequestSchema = Joi.object({
  questionId: Joi.string().hex().length(24).required(),
  contentType: Joi.string().valid("image/png").required(),
  size: Joi.number().integer().min(1).max(10 * 1024 * 1024).required()
});

const submissionImageUploadConfirmationSchema = Joi.object({
  uploadId: Joi.string().hex().length(24).required()
});

const transcriptSchema = Joi.object({
  steps: Joi.array().items(Joi.string().trim().min(1)).min(1).required(),
  final_answer: Joi.string().trim().min(1).required()
});

module.exports = {
  createSubmissionSchema,
  reviewSubmissionSchema,
  submissionImageUploadConfirmationSchema,
  submissionImageUploadRequestSchema,
  transcriptSchema,
  updateSubmissionSchema
};
