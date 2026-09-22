const mongoose = require("mongoose");

const submissionImageUploadSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true
  },
  object_key: {
    type: String,
    required: true,
    unique: true
  },
  content_type: {
    type: String,
    enum: ["image/png"],
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 1,
    max: 10 * 1024 * 1024
  },
  expires_at: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed"],
    default: "pending",
    required: true
  },
  confirmed_at: Date,
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Submission"
  }
}, { timestamps: true });

module.exports = mongoose.model("SubmissionImageUpload", submissionImageUploadSchema);
