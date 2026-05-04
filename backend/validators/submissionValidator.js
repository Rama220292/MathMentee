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
  teacher_score: Joi.number().min(0).required(),

  teacher_feedback: Joi.string().allow("").required()
});

module.exports = { createSubmissionSchema, updateSubmissionSchema, reviewSubmissionSchema };