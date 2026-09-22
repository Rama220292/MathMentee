const mongoose = require("mongoose");

const Question = require("../models/Question");
const QuestionVersion = require("../models/QuestionVersion");
const Submission = require("../models/Submission");
const SubmissionImageUpload = require("../models/SubmissionImageUpload");
const User = require("../models/User");
const gradeWithAI = require("../services/aiService");
const { extractSubmissionImage } = require("../services/submissionExtractionService");
const {
  createSubmissionImageReadUrl,
  createSubmissionImageUpload,
  verifySubmissionImageUpload
} = require("../services/submissionImageStorageService");
const {
  createQuestionVersion,
  snapshotFromVersion
} = require("../services/questionVersionService");

const getQuestionContext = async (questionId) => {
  const question = await Question.findById(questionId);
  if (!question || !question.isPublished || question.archived_at) return null;

  let version = question.published_version
    ? await QuestionVersion.findById(question.published_version)
    : null;

  if (!version) {
    version = await createQuestionVersion(question, question.created_by);
    question.published_version = version._id;
    await question.save();
  }

  return {
    question,
    version,
    snapshot: snapshotFromVersion(version)
  };
};

const answerForGrading = (answer) => ({
  steps: answer.steps || [],
  final_answer: answer.final_answer || ""
});

const sumMarksAwarded = (breakdown = []) => breakdown.reduce(
  (sum, item) => sum + item.marks_awarded,
  0
);

const sumMarksAvailable = (breakdown = []) => breakdown.reduce(
  (sum, item) => sum + item.marks_available,
  0
);

const marksEqual = (left, right) => Math.abs(Number(left) - Number(right)) < 0.001;

const getPairedStudentIds = async (teacherId) => (
  await User.find({ role: "student", assignedTutor: teacherId }).distinct("_id")
);

const teacherCanAccessStudent = async (teacherId, studentId) => {
  const student = await User.exists({
    _id: studentId,
    role: "student",
    assignedTutor: teacherId
  });
  return Boolean(student);
};

const submissionResponse = (submission, role) => {
  const data = typeof submission.toObject === "function"
    ? submission.toObject()
    : { ...submission };

  if (data.question_snapshot) {
    const logicalQuestionId = data.questionId?._id || data.questionId;
    data.questionId = { _id: logicalQuestionId, ...data.question_snapshot };
  }

  data.has_source_image = Boolean(data.source_asset || data.input_method === "handwriting");
  delete data.source_asset;

  if (data.review_status === "reviewed") {
    if (data.tutor_score == null) data.tutor_score = data.teacher_score ?? data.final_score;
    if (data.tutor_feedback == null) {
      data.tutor_feedback = data.teacher_feedback ?? data.final_feedback;
    }
  }

  delete data.final_score;
  delete data.final_feedback;
  delete data.teacher_score;
  delete data.teacher_feedback;
  delete data.final_answer_correct;

  if (data.confirmed_answer) data.structured_answer = answerForGrading(data.confirmed_answer);

  if (role === "student") {
    if (data.questionId) {
      data.questionId = {
        _id: data.questionId._id,
        title: data.questionId.title,
        question_text: data.questionId.question_text,
        topic: data.questionId.topic,
        level: data.questionId.level,
        total_marks: data.questionId.total_marks
      };
    }
    delete data.questionVersionId;
    delete data.question_snapshot;
    delete data.marks_breakdown;
    delete data.reviewed_by;
    if (data.review_status !== "reviewed") {
      delete data.tutor_score;
      delete data.tutor_feedback;
      delete data.reviewed_at;
    }
  }

  return data;
};

// Legacy typed submission endpoint retained for existing clients during migration.
const createSubmission = async (req, res) => {
  try {
    const context = await getQuestionContext(req.body.questionId);
    if (!context) return res.status(404).json({ err: "Question not found" });

    const aiResult = await gradeWithAI(req.body.structured_answer, context.version);
    const now = new Date();
    const submission = await Submission.create({
      studentId: req.user.id,
      questionId: req.body.questionId,
      questionVersionId: context.version._id,
      question_snapshot: context.snapshot,
      input_method: "text",
      processing_status: "ai_graded",
      raw_input: req.body.raw_input,
      structured_answer: req.body.structured_answer,
      confirmed_answer: { ...req.body.structured_answer, confirmed_at: now },
      ai_score: aiResult.score,
      ai_feedback: aiResult.feedback,
      marks_breakdown: aiResult.marks_breakdown,
      review_status: "ai_graded"
    });

    res.status(201).json(submissionResponse(submission, "student"));
  } catch (err) {
    res.status(502).json({ err: err.message || "Could not grade submission" });
  }
};

const updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ err: "Submission not found" });
    if (submission.studentId.toString() !== req.user.id) {
      return res.status(403).json({ err: "Not authorized" });
    }
    if (submission.review_status === "reviewed" || submission.input_method === "handwriting") {
      return res.status(403).json({ err: "This submission can no longer be edited" });
    }

    const question = submission.questionVersionId
      ? await QuestionVersion.findById(submission.questionVersionId)
      : submission.question_snapshot;
    if (!question) return res.status(409).json({ err: "Question version unavailable" });

    const aiResult = await gradeWithAI(req.body.structured_answer, question);
    submission.raw_input = req.body.raw_input || submission.raw_input;
    submission.structured_answer = req.body.structured_answer;
    submission.confirmed_answer = { ...req.body.structured_answer, confirmed_at: new Date() };
    submission.ai_score = aiResult.score;
    submission.ai_feedback = aiResult.feedback;
    submission.marks_breakdown = aiResult.marks_breakdown;
    submission.processing_status = "ai_graded";
    submission.review_status = "ai_graded";
    await submission.save();

    res.json(submissionResponse(submission, "student"));
  } catch (err) {
    res.status(502).json({ err: err.message || "Could not grade submission" });
  }
};

const createHandwritingUploadRequest = async (req, res) => {
  try {
    const context = await getQuestionContext(req.body.questionId);
    if (!context) return res.status(404).json({ err: "Question not found" });

    const uploadId = new mongoose.Types.ObjectId();
    const upload = await createSubmissionImageUpload({
      studentId: req.user.id,
      uploadId: uploadId.toString(),
      size: req.body.size
    });
    await SubmissionImageUpload.create({
      _id: uploadId,
      student: req.user.id,
      question: req.body.questionId,
      object_key: upload.objectKey,
      content_type: "image/png",
      size: req.body.size,
      expires_at: new Date(upload.expiresAt)
    });

    res.status(201).json({ uploadId: uploadId.toString(), ...upload });
  } catch (err) {
    if (err.code === "STORAGE_NOT_CONFIGURED") return res.status(503).json({ err: err.message });
    res.status(500).json({ err: "Could not create handwriting upload" });
  }
};

const handwritingConfirmationResponse = (submission) => ({
  submissionId: submission._id,
  status: submission.processing_status,
  sourceAsset: {
    contentType: submission.source_asset.content_type,
    size: submission.source_asset.size
  },
  confirmedAt: submission.source_asset.confirmed_at
});

const confirmHandwritingUpload = async (req, res) => {
  try {
    const pending = await SubmissionImageUpload.findOne({
      _id: req.body.uploadId,
      student: req.user.id
    });
    if (!pending) return res.status(404).json({ err: "Handwriting upload not found" });

    if (pending.status === "confirmed" && pending.submission) {
      const existing = await Submission.findById(pending.submission).select("+source_asset");
      if (existing) return res.json(handwritingConfirmationResponse(existing));
    }
    if (pending.expires_at <= new Date()) {
      return res.status(410).json({ err: "Handwriting upload request expired" });
    }

    const context = await getQuestionContext(pending.question);
    if (!context) return res.status(404).json({ err: "Question not found" });
    const metadata = await verifySubmissionImageUpload({
      objectKey: pending.object_key,
      expectedSize: pending.size
    });
    const confirmedAt = new Date();
    const submission = await Submission.create({
      studentId: req.user.id,
      questionId: pending.question,
      questionVersionId: context.version._id,
      question_snapshot: context.snapshot,
      input_method: "handwriting",
      processing_status: "uploaded",
      review_status: "pending",
      source_asset: {
        object_key: pending.object_key,
        content_type: metadata.contentType,
        size: metadata.size,
        etag: metadata.etag,
        uploaded_at: metadata.lastModified,
        confirmed_at: confirmedAt
      }
    });

    pending.status = "confirmed";
    pending.confirmed_at = confirmedAt;
    pending.submission = submission._id;
    await pending.save();
    res.status(201).json(handwritingConfirmationResponse(submission));
  } catch (err) {
    if (err.code === "UPLOAD_NOT_FOUND") return res.status(404).json({ err: err.message });
    if (err.code === "UPLOAD_METADATA_MISMATCH") return res.status(422).json({ err: err.message });
    if (["STORAGE_NOT_CONFIGURED", "STORAGE_UNAVAILABLE"].includes(err.code)) {
      return res.status(503).json({ err: err.message });
    }
    res.status(500).json({ err: "Could not confirm handwriting upload" });
  }
};

const extractHandwriting = async (req, res) => {
  let submission;
  try {
    submission = await Submission.findOne({
      _id: req.params.id,
      studentId: req.user.id,
      input_method: "handwriting"
    }).select("+source_asset");
    if (!submission) return res.status(404).json({ err: "Submission draft not found" });
    if (!["uploaded", "grading_error"].includes(submission.processing_status)) {
      return res.status(409).json({ err: "Submission is not ready for extraction" });
    }

    submission.processing_status = "extracting";
    await submission.save();
    const extracted = await extractSubmissionImage({
      objectKey: submission.source_asset.object_key,
      questionText: submission.question_snapshot.question_text
    });
    submission.extracted_answer = { ...extracted, extracted_at: new Date() };
    submission.processing_status = "extracted";
    await submission.save();

    res.json({
      submissionId: submission._id,
      status: submission.processing_status,
      extractedAnswer: submission.extracted_answer
    });
  } catch (err) {
    if (submission) {
      submission.processing_status = "grading_error";
      await submission.save().catch(() => {});
    }
    res.status(err.code === "STORAGE_UNAVAILABLE" ? 503 : 502)
      .json({ err: "Could not transcribe handwriting" });
  }
};

const updateTranscript = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      studentId: req.user.id,
      input_method: "handwriting"
    });
    if (!submission) return res.status(404).json({ err: "Submission draft not found" });
    const retryableGrade = submission.processing_status === "grading_error"
      && submission.extracted_answer?.extracted_at
      && submission.confirmed_answer?.confirmed_at
      && submission.review_status === "pending";
    if (submission.processing_status !== "extracted" && !retryableGrade) {
      return res.status(409).json({ err: "Transcript cannot be edited in its current state" });
    }
    submission.confirmed_answer = answerForGrading(req.body);
    submission.processing_status = "extracted";
    await submission.save();
    res.json({ submissionId: submission._id, confirmedAnswer: submission.confirmed_answer });
  } catch (err) {
    res.status(500).json({ err: "Could not save transcript corrections" });
  }
};

const confirmTranscriptAndGrade = async (req, res) => {
  let submission;
  try {
    submission = await Submission.findOne({
      _id: req.params.id,
      studentId: req.user.id,
      input_method: "handwriting"
    });
    if (!submission) return res.status(404).json({ err: "Submission draft not found" });
    if (submission.processing_status !== "extracted" || !submission.confirmed_answer) {
      return res.status(409).json({ err: "Confirm the corrected transcript before grading" });
    }

    submission.confirmed_answer.confirmed_at = new Date();
    submission.structured_answer = answerForGrading(submission.confirmed_answer);
    submission.raw_input = submission.extracted_answer?.raw_text || "";
    submission.processing_status = "grading";
    await submission.save();

    const aiResult = await gradeWithAI(
      answerForGrading(submission.confirmed_answer),
      submission.question_snapshot
    );
    submission.ai_score = aiResult.score;
    submission.ai_feedback = aiResult.feedback;
    submission.marks_breakdown = aiResult.marks_breakdown;
    submission.processing_status = "ai_graded";
    submission.review_status = "ai_graded";
    await submission.save();
    res.json(submissionResponse(submission, "student"));
  } catch (err) {
    if (submission) {
      submission.processing_status = "grading_error";
      await submission.save().catch(() => {});
    }
    console.error("Confirmed answer grading failed", {
      submissionId: req.params.id,
      name: err.name,
      code: err.code,
      status: err.status
    });
    res.status(502).json({ err: "Could not grade the confirmed answer. Your corrections are saved; please try submitting again." });
  }
};

const getSubmissionById = async (req, res) => {
  try {
    const query = Submission.findById(req.params.id)
      .select("+teacher_score +teacher_feedback +final_score +final_feedback")
      .populate("questionId")
      .populate("studentId", "name email");
    if (req.user.role !== "student") query.select("+source_asset");
    const submission = await query;
    if (!submission) return res.status(404).json({ err: "Submission not found" });
    if (req.user.role === "student" && submission.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ err: "Not authorized" });
    }
    if (
      req.user.role === "teacher" &&
      !(await teacherCanAccessStudent(req.user.id, submission.studentId._id))
    ) {
      return res.status(403).json({ err: "Not authorized" });
    }
    res.json(submissionResponse(submission, req.user.role));
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const getSubmissionImageUrl = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).select("+source_asset");
    if (!submission || !submission.source_asset) {
      return res.status(404).json({ err: "Submission image not found" });
    }
    if (req.user.role === "student" && submission.studentId.toString() !== req.user.id) {
      return res.status(403).json({ err: "Not authorized" });
    }
    if (
      req.user.role === "teacher" &&
      !(await teacherCanAccessStudent(req.user.id, submission.studentId))
    ) {
      return res.status(403).json({ err: "Not authorized" });
    }
    if (!["student", "teacher", "content_manager"].includes(req.user.role)) {
      return res.status(403).json({ err: "Not authorized" });
    }
    const imageUrl = await createSubmissionImageReadUrl({
      objectKey: submission.source_asset.object_key
    });
    res.json({ imageUrl, expiresIn: 300 });
  } catch (err) {
    res.status(err.code === "STORAGE_NOT_CONFIGURED" ? 503 : 500)
      .json({ err: "Could not access submission image" });
  }
};

const reviewSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ err: "Submission not found" });
    if (
      req.user.role === "teacher" &&
      !(await teacherCanAccessStudent(req.user.id, submission.studentId))
    ) {
      return res.status(403).json({ err: "Not authorized" });
    }

    let totalMarks = submission.question_snapshot?.total_marks;
    if (totalMarks == null) {
      const question = await Question.findById(submission.questionId).select("total_marks");
      totalMarks = question?.total_marks;
    }

    if (totalMarks == null) {
      return res.status(409).json({ err: "Question total marks unavailable" });
    }

    if (req.body.tutor_score > totalMarks) {
      return res.status(400).json({ err: "Tutor score cannot exceed total marks" });
    }

    if (req.body.tutor_marks_breakdown) {
      const invalidItem = req.body.tutor_marks_breakdown.find(
        (item) => item.marks_awarded > item.marks_available
      );
      if (invalidItem) {
        return res.status(400).json({ err: "Tutor marks cannot exceed the available marks for a criterion" });
      }

      const awardedTotal = sumMarksAwarded(req.body.tutor_marks_breakdown);
      const availableTotal = sumMarksAvailable(req.body.tutor_marks_breakdown);
      if (!marksEqual(availableTotal, totalMarks)) {
        return res.status(400).json({ err: "Tutor mark allocations must add up to the question total marks" });
      }
      if (!marksEqual(awardedTotal, req.body.tutor_score)) {
        return res.status(400).json({ err: "Tutor score must equal the sum of reviewed marks" });
      }
    }

    submission.tutor_score = req.body.tutor_score;
    if (req.body.tutor_marks_breakdown) {
      submission.tutor_marks_breakdown = req.body.tutor_marks_breakdown;
    }
    submission.tutor_feedback = req.body.tutor_feedback;
    submission.reviewed_by = req.user.id;
    submission.reviewed_at = new Date();
    submission.review_status = "reviewed";
    submission.processing_status = "reviewed";
    await submission.save();
    res.json(submissionResponse(submission, req.user.role));
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      studentId: req.user.id,
      review_status: { $in: ["ai_graded", "reviewed"] }
    })
      .select("+teacher_score +teacher_feedback +final_score +final_feedback")
      .populate("questionId")
      .sort({ createdAt: -1 });
    res.json(submissions.map((item) => submissionResponse(item, "student")));
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const getAllSubmissions = async (req, res) => {
  try {
    const filter = {
      review_status: { $in: ["ai_graded", "reviewed"] }
    };

    if (req.user.role === "teacher") {
      filter.studentId = { $in: await getPairedStudentIds(req.user.id) };
    }

    const submissions = await Submission.find(filter)
      .select("+teacher_score +teacher_feedback +final_score +final_feedback")
      .populate("questionId")
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });
    res.json(submissions.map((item) => submissionResponse(item, req.user.role)));
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const getPendingSubmissions = async (req, res) => {
  try {
    const filter = { review_status: "ai_graded" };

    if (req.user.role === "teacher") {
      filter.studentId = { $in: await getPairedStudentIds(req.user.id) };
    }

    const submissions = await Submission.find(filter)
      .select("+teacher_score +teacher_feedback +final_score +final_feedback")
      .populate("questionId")
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });
    res.json(submissions.map((item) => submissionResponse(item, req.user.role)));
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

module.exports = {
  confirmHandwritingUpload,
  confirmTranscriptAndGrade,
  createHandwritingUploadRequest,
  createSubmission,
  extractHandwriting,
  getAllSubmissions,
  getMySubmissions,
  getPendingSubmissions,
  getSubmissionById,
  getSubmissionImageUrl,
  reviewSubmission,
  updateSubmission,
  updateTranscript
};
