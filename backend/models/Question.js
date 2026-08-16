const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  content: String,
  marks: Number
});

const requiresCompletedContent = function () {
  const question = typeof this.ownerDocument === "function"
    ? this.ownerDocument()
    : this;
  return ["ready", "published"].includes(question.authoring_status);
};

const sourceAssetSchema = new mongoose.Schema({
  object_key: {
    type: String,
    required: true
  },
  content_type: {
    type: String,
    enum: ["image/jpeg", "image/png", "image/webp"],
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  etag: String,
  uploaded_at: Date,
  confirmed_at: Date
}, { _id: false });

const extractionSchema = new mongoose.Schema({
  provider: String,
  model: String,
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "error"]
  },
  confidence: { type: Number, min: 0, max: 1 },
  review_notes: [String],
  error: String,
  completed_at: Date
}, { _id: false });

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: requiresCompletedContent
  },

  question_text: {
    type: String,
    required: requiresCompletedContent
  },

  topic: {
    type: String,
    enum: ["Algebra", "Geometry"],
    required: requiresCompletedContent
  },

  level: {
    type: String,
    enum: ["Sec1", "Sec2", "Sec3", "Sec4"],
    required: requiresCompletedContent
  },

  model_answer: {
    final_answer: {
      type: String,
      required: requiresCompletedContent
    },

    steps: [stepSchema]
  },

  final_answer_marks: {
    type: Number,
    default: 0
  },

  total_marks: {
    type: Number,
    default: 0
  },

  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  authoring_status: {
    type: String,
    enum: ["uploaded", "extracting", "extracted", "ready", "published", "error", "archived"],
    default: "ready",
    required: true
  },

  source_asset: {
    type: sourceAssetSchema,
    select: false
  },

  extraction: extractionSchema,

  isPublished: {
    type: Boolean,
    default: false
  },

  current_version: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionVersion"
  },

  published_version: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionVersion"
  },

  version_count: {
    type: Number,
    default: 0,
    min: 0
  },

  archived_at: {
    type: Date,
    default: null
  },

  archived_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status_before_archive: {
    type: String,
    enum: ["uploaded", "extracting", "extracted", "ready", "published", "error"]
  }

}, { timestamps: true });

questionSchema.index(
  { "source_asset.object_key": 1 },
  { unique: true, sparse: true }
);

// calculate total_marks

questionSchema.pre("save", async function () {
  const stepMarks = (this.model_answer?.steps || []).reduce(
    (sum, step) => sum + (step.marks || 0),
    0
  );

  this.total_marks = stepMarks + (this.final_answer_marks || 0);

});


module.exports = mongoose.model("Question", questionSchema);
