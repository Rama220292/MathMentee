const mongoose = require("mongoose");

const marksBreakdownSchema = new mongoose.Schema({
  criterion: { type: String, required: true },
  marks_awarded: { type: Number, required: true, min: 0 },
  marks_available: { type: Number, required: true, min: 0 },
  evidence: { type: String, default: "" },
  feedback: { type: String, default: "" }
}, { _id: false });

const answerSchema = new mongoose.Schema({
  raw_text: { type: String, default: "" },
  steps: { type: [String], default: [] },
  final_answer: { type: String, default: "" },
  review_notes: { type: [String], default: [] },
  extracted_at: Date,
  confirmed_at: Date
}, { _id: false });

const sourceAssetSchema = new mongoose.Schema({
  object_key: { type: String, required: true },
  content_type: { type: String, enum: ["image/png"], required: true },
  size: { type: Number, required: true },
  etag: String,
  uploaded_at: Date,
  confirmed_at: Date
}, { _id: false });

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
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  questionVersionId: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionVersion" },
  question_snapshot: questionSnapshotSchema,
  input_method: {
    type: String,
    enum: ["text", "handwriting"],
    default: "text",
    required: true
  },
  processing_status: {
    type: String,
    enum: ["uploaded", "extracting", "extracted", "grading", "ai_graded", "grading_error", "reviewed"],
    default: "ai_graded",
    required: true
  },
  source_asset: { type: sourceAssetSchema, select: false },
  extracted_answer: answerSchema,
  confirmed_answer: answerSchema,

  // Legacy typed fields remain readable while existing data is migrated.
  raw_input: { type: String, default: "" },
  structured_answer: {
    final_answer: { type: String, default: "" },
    steps: { type: [String], default: [] }
  },

  ai_score: { type: Number, min: 0 },
  ai_feedback: { type: String, default: "" },
  marks_breakdown: [marksBreakdownSchema],
  review_status: {
    type: String,
    enum: ["pending", "ai_graded", "reviewed"],
    default: "pending"
  },
  reviewed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tutor_score: { type: Number, min: 0 },
  tutor_feedback: String,
  reviewed_at: Date,

  // Read-only migration bridge for submissions created before tutor naming.
  teacher_score: { type: Number, select: false },
  teacher_feedback: { type: String, select: false },
  final_score: { type: Number, select: false },
  final_feedback: { type: String, select: false }
}, { timestamps: true });

submissionSchema.index({ "source_asset.object_key": 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Submission", submissionSchema);
