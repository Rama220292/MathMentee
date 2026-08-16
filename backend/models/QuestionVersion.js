const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema({
  content: { type: String, required: true },
  marks: { type: Number, required: true }
}, { _id: false });

const questionVersionSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
    immutable: true
  },
  version_number: {
    type: Number,
    min: 1,
    required: true,
    immutable: true
  },
  title: { type: String, required: true, immutable: true },
  question_text: { type: String, required: true, immutable: true },
  topic: {
    type: String,
    enum: ["Algebra", "Geometry"],
    required: true,
    immutable: true
  },
  level: {
    type: String,
    enum: ["Sec1", "Sec2", "Sec3", "Sec4"],
    required: true,
    immutable: true
  },
  model_answer: {
    final_answer: { type: String, required: true, immutable: true },
    steps: { type: [stepSchema], required: true, immutable: true }
  },
  final_answer_marks: { type: Number, min: 0, required: true, immutable: true },
  total_marks: { type: Number, min: 0, required: true, immutable: true },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    immutable: true
  }
}, { timestamps: true });

questionVersionSchema.index(
  { question: 1, version_number: 1 },
  { unique: true }
);

module.exports = mongoose.model("QuestionVersion", questionVersionSchema);
