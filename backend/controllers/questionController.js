const mongoose = require("mongoose")
const Question = require("../models/Question");
const QuestionVersion = require("../models/QuestionVersion");
const QuestionImageUpload = require("../models/QuestionImageUpload");
const {
  createQuestionImageUpload,
  verifyQuestionImageUpload
} = require("../services/questionImageStorageService");
const { extractQuestionImage } = require("../services/questionExtractionService");
const {
  createQuestionVersion,
  versionContent
} = require("../services/questionVersionService");

const idsMatch = (left, right) =>
  left && right && left.toString() === right.toString();

const studentQuestionResponse = (data) => ({
  _id: data._id,
  title: data.title,
  question_text: data.question_text,
  topic: data.topic,
  level: data.level,
  total_marks: data.total_marks
});

const questionResponse = async (question, role) => {
  const data = typeof question.toObject === "function"
    ? question.toObject()
    : { ...question };

  if (role === "content_manager") {
    return {
      ...data,
      has_unpublished_changes: Boolean(
        data.isPublished &&
        data.current_version &&
        !idsMatch(data.current_version, data.published_version)
      )
    };
  }

  if (data.published_version) {
    const version = await QuestionVersion.findById(data.published_version);
    if (version) Object.assign(data, versionContent(version));
  }

  if (role === "student") return studentQuestionResponse(data);

  return data;
};

const calculateTotalMarks = (model_answer, final_answer_marks) => {
  const stepMarks = model_answer.steps.reduce(
    (sum, step) => sum + (step.marks || 0),
    0
  );

  return stepMarks + final_answer_marks;
};
// CREATE QUESTION (Teacher)
const createQuestion = async (req, res) => {
  try {
    const question = await Question.create({
      ...req.body,
      created_by: req.user.id, // from JWT
      isPublished: false,
      authoring_status: "ready"
    });

    await createQuestionVersion(question, req.user.id);

    res.status(201).json(await questionResponse(question, req.user.role));

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};


// GET ALL QUESTIONS
const getQuestions = async (req, res) => {
  try {
    const { topic, level, archived } = req.query;

    let filter = {};

    if (req.user.role !== "content_manager") {
      filter.isPublished = true;
      filter.archived_at = null;
    } else {
      filter.archived_at = archived === "true" ? { $ne: null } : null;
    }

    if (topic) filter.topic = topic;
    if (level) filter.level = level;

    const query = Question.find(filter);
    if (req.user.role === "content_manager") query.select("+source_asset");
    const questions = await query;

    res.json(await Promise.all(
      questions.map((question) => questionResponse(question, req.user.role))
    ));

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};


// GET SINGLE QUESTION
const getQuestionById = async (req, res) => {
  try {
    const query = Question.findById(req.params.id);
    if (req.user.role === "content_manager") query.select("+source_asset");
    const question = await query;

    if (!question) {
      return res.status(404).json({ err: "Question not found" });
    }

    if (
      req.user.role !== "content_manager" &&
      (!question.isPublished || question.archived_at)
    ) {
      return res.status(404).json({ err: "Question not found" });
    }

    res.json(await questionResponse(question, req.user.role));

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};


// UPDATE QUESTION (Teacher)
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ err: "Question not found" });
    }

    if (question.archived_at) {
      return res.status(409).json({ err: "Restore the question before editing it" });
    }

    // Lazily establish an immutable baseline for questions created before
    // versioning was introduced, before applying their first new edit.
    if (question.isPublished && !question.published_version) {
      const publishedBaseline = await createQuestionVersion(question, req.user.id);
      question.published_version = publishedBaseline._id;
      await question.save();
    }

    if (req.body.title !== undefined) {
      question.title = req.body.title;
    }

    if (req.body.question_text !== undefined) {
      question.question_text = req.body.question_text;
    }

    if (req.body.topic !== undefined) {
      question.topic = req.body.topic;
    }

    if (req.body.level !== undefined) {
      question.level = req.body.level;
    }

    if (req.body.model_answer !== undefined) {
      question.model_answer = req.body.model_answer;
    }

    if (req.body.final_answer_marks !== undefined) {
      question.final_answer_marks = req.body.final_answer_marks;
    }

    if (
      !question.isPublished &&
      ["uploaded", "extracting", "extracted", "error"].includes(question.authoring_status)
    ) {
      question.authoring_status = "ready";
    }

    // recalculate total_marks
    const stepMarks = (question.model_answer.steps || []).reduce(
      (sum, step) => sum + (step.marks || 0),
      0
    );

    question.total_marks =
      stepMarks + (question.final_answer_marks || 0);

    await question.save();

    await createQuestionVersion(question, req.user.id);

    res.json(await questionResponse(question, req.user.role));

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const setQuestionPublication = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ err: "Question not found" });
    }

    if (question.archived_at) {
      return res.status(409).json({ err: "Restore the question before publishing it" });
    }

    if (
      req.body.isPublished &&
      !["ready", "published"].includes(question.authoring_status)
    ) {
      return res.status(409).json({
        err: "Review and save the complete question before publishing"
      });
    }

    if (req.body.isPublished && !question.current_version) {
      await createQuestionVersion(question, req.user.id);
    }

    question.isPublished = req.body.isPublished;
    question.authoring_status = req.body.isPublished ? "published" : "ready";
    if (req.body.isPublished) {
      question.published_version = question.current_version;
    }
    await question.save();

    res.json({
      id: question._id,
      isPublished: question.isPublished,
      authoring_status: question.authoring_status,
      current_version: question.current_version,
      published_version: question.published_version,
      message: question.isPublished
        ? "Question published successfully"
        : "Question unpublished successfully"
    });
  } catch (err) {
    const status = err.name === "ValidationError" ? 400 : 500;
    res.status(status).json({ err: err.message });
  }
};

const setQuestionArchive = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ err: "Question not found" });
    }

    if (req.body.archived) {
      if (!question.archived_at) {
        question.status_before_archive = question.authoring_status;
      }
      question.isPublished = false;
      question.authoring_status = "archived";
      question.archived_at = new Date();
      question.archived_by = req.user.id;
    } else {
      question.isPublished = false;
      question.authoring_status = question.status_before_archive === "published"
        ? "ready"
        : question.status_before_archive || "ready";
      question.archived_at = null;
      question.archived_by = undefined;
      question.status_before_archive = undefined;
    }

    await question.save();

    res.json({
      id: question._id,
      archived: Boolean(question.archived_at),
      authoring_status: question.authoring_status,
      message: question.archived_at
        ? "Question archived successfully"
        : "Question restored successfully"
    });

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

// To fetch question options
const getQuestionMeta = async (req, res) => {
  try {
    const topicEnum = ["Algebra", "Geometry"];
    const levelEnum = ["Sec1", "Sec2", "Sec3", "Sec4"];

    res.json({
      topics: topicEnum,
      levels: levelEnum
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const createQuestionImageUploadRequest = async (req, res) => {
  try {
    const uploadId = new mongoose.Types.ObjectId();
    const upload = await createQuestionImageUpload({
      userId: req.user.id,
      uploadId: uploadId.toString(),
      contentType: req.body.contentType,
      size: req.body.size
    });

    await QuestionImageUpload.create({
      _id: uploadId,
      created_by: req.user.id,
      object_key: upload.objectKey,
      content_type: req.body.contentType,
      size: req.body.size,
      expires_at: new Date(upload.expiresAt)
    });

    res.status(201).json({ uploadId: uploadId.toString(), ...upload });
  } catch (err) {
    if (err.code === "STORAGE_NOT_CONFIGURED") {
      return res.status(503).json({ err: err.message });
    }

    res.status(500).json({ err: "Could not create question image upload" });
  }
};

const confirmationResponse = (question) => ({
  draftId: question._id,
  status: question.authoring_status,
  sourceAsset: {
    contentType: question.source_asset.content_type,
    size: question.source_asset.size
  },
  confirmedAt: question.source_asset.confirmed_at
});

const confirmQuestionImageUpload = async (req, res) => {
  try {
    const pendingUpload = await QuestionImageUpload.findOne({
      _id: req.body.uploadId,
      created_by: req.user.id
    });

    if (!pendingUpload) {
      return res.status(404).json({ err: "Question image upload not found" });
    }

    if (pendingUpload.status === "confirmed" && pendingUpload.question) {
      const existingQuestion = await Question.findById(pendingUpload.question)
        .select("+source_asset");
      if (existingQuestion) return res.json(confirmationResponse(existingQuestion));
    }

    if (pendingUpload.expires_at <= new Date()) {
      return res.status(410).json({ err: "Question image upload request expired" });
    }

    const metadata = await verifyQuestionImageUpload({
      objectKey: pendingUpload.object_key,
      expectedContentType: pendingUpload.content_type,
      expectedSize: pendingUpload.size
    });
    const confirmedAt = new Date();
    const question = await Question.create({
      created_by: req.user.id,
      authoring_status: "uploaded",
      isPublished: false,
      source_asset: {
        object_key: pendingUpload.object_key,
        content_type: metadata.contentType,
        size: metadata.size,
        etag: metadata.etag,
        uploaded_at: metadata.lastModified,
        confirmed_at: confirmedAt
      }
    });

    pendingUpload.status = "confirmed";
    pendingUpload.confirmed_at = confirmedAt;
    pendingUpload.question = question._id;
    await pendingUpload.save();

    res.status(201).json(confirmationResponse(question));
  } catch (err) {
    if (err.code === "UPLOAD_NOT_FOUND") {
      return res.status(404).json({ err: err.message });
    }
    if (err.code === "UPLOAD_METADATA_MISMATCH") {
      return res.status(422).json({ err: err.message });
    }
    if (err.code === "STORAGE_NOT_CONFIGURED" || err.code === "STORAGE_UNAVAILABLE") {
      return res.status(503).json({ err: err.message });
    }

    res.status(500).json({ err: "Could not confirm question image upload" });
  }
};

const extractQuestionDraft = async (req, res) => {
  let question;
  try {
    question = await Question.findOne({
      _id: req.params.id,
      created_by: req.user.id,
      isPublished: false
    }).select("+source_asset");
    if (!question) return res.status(404).json({ err: "Question draft not found" });
    if (!question.source_asset) return res.status(409).json({ err: "Question draft has no source image" });

    question.authoring_status = "extracting";
    question.extraction = { provider: "openai", status: "processing" };
    await question.save();

    const extracted = await extractQuestionImage({ objectKey: question.source_asset.object_key });
    question.title = extracted.title;
    question.question_text = extracted.question_text;
    question.topic = extracted.topic || undefined;
    question.level = extracted.level || undefined;
    question.model_answer = extracted.model_answer;
    question.final_answer_marks = extracted.final_answer_marks;
    question.authoring_status = "extracted";
    question.extraction = {
      provider: "openai",
      model: process.env.OPENAI_EXTRACTION_MODEL || "gpt-5-mini",
      status: "completed",
      confidence: extracted.confidence,
      review_notes: extracted.review_notes,
      completed_at: new Date()
    };
    await question.save();

    res.json({
      draftId: question._id,
      status: question.authoring_status,
      extractedContent: {
        title: question.title,
        question_text: question.question_text,
        topic: question.topic || null,
        level: question.level || null,
        model_answer: question.model_answer,
        final_answer_marks: question.final_answer_marks
      },
      confidence: question.extraction.confidence,
      reviewNotes: question.extraction.review_notes
    });
  } catch (err) {
    if (question) {
      question.authoring_status = "error";
      question.extraction = {
        provider: "openai",
        status: "error",
        error: "Extraction failed"
      };
      await question.save().catch(() => {});
    }
    const status = err.code === "STORAGE_UNAVAILABLE" ? 503 : 502;
    res.status(status).json({ err: "Could not extract question image" });
  }
};


module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  setQuestionPublication,
  setQuestionArchive,
  getQuestionMeta,
  createQuestionImageUploadRequest,
  confirmQuestionImageUpload,
  extractQuestionDraft
};
