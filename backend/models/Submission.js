const mongoose = require("mongoose");

const marksBreakdownSchema = new mongoose.Schema({
  step_index: {type: Number, required: true},
  marks_awarded: {type: Number, required: true},
  feedback: String
});

const questionSnapshotSchema = new mongoose.Schema({
  version_number: { type: Number, required: true },
  title: { type: String, required: true },
  question_text: { type: String, required: true },
  topic: { type: String, required: true },
  level: { type: String, required: true },
  model_answer: {
    final_answer: { type: String, required: true },
    steps: [{
      content: { type: String, required: true },
      marks: { type: Number, required: true }
    }]
  },
  final_answer_marks: { type: Number, required: true },
  total_marks: { type: Number, required: true }
}, { _id: false });

const submissionSchema = new mongoose.Schema({

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question", 
    required: true
  },

  questionVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionVersion"
  },

  question_snapshot: {
    type: questionSnapshotSchema
  },

  raw_input: {
    type: String,
    required: true
  },

  structured_answer: {
    final_answer: {type: String, default: ""},
    steps: {type: [String], default: []}
  },

  ai_score: {type: Number, default: 0},
  ai_feedback: {type: String, default: ""},
  final_answer_correct: {type: Boolean, default: false},

  marks_breakdown: [marksBreakdownSchema],

  review_status: {
    type: String,
    enum: ["pending", "ai_graded", "reviewed"],
    default: "pending"
  },

  reviewed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  teacher_score: Number,
  teacher_feedback: String,

  reviewedAt: Date,

  final_score: {type: Number, default: 0},
  final_feedback: {type: String, default:""}

}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);
