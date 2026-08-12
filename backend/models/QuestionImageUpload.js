const mongoose = require("mongoose");

const questionImageUploadSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  object_key: {
    type: String,
    required: true,
    unique: true
  },
  content_type: {
    type: String,
    enum: ["image/jpeg", "image/png", "image/webp"],
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
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question"
  }
}, { timestamps: true });

module.exports = mongoose.model("QuestionImageUpload", questionImageUploadSchema);
