const Submission = require("../models/Submission");
const Question = require("../models/Question");
const QuestionVersion = require("../models/QuestionVersion");
const gradeAnswer = require("../services/gradingService");
const gradeWithAI = require("../services/aiService");
const {
  createQuestionVersion,
  snapshotFromVersion
} = require("../services/questionVersionService");
const { createSubmissionSchema, updateSubmissionSchema, reviewSubmissionSchema } = require("../validators/submissionValidator");
const mongoose = require("mongoose");

const submissionResponse = (submission, role) => {
  const data = typeof submission.toObject === "function"
    ? submission.toObject()
    : { ...submission };

  if (data.question_snapshot) {
    const logicalQuestionId = data.questionId?._id || data.questionId;
    data.questionId = {
      _id: logicalQuestionId,
      ...data.question_snapshot
    };
  }

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
    delete data.final_answer_correct;
    delete data.teacher_score;
    delete data.teacher_feedback;
    delete data.reviewed_by;

    if (data.review_status !== "reviewed") {
      delete data.final_score;
      delete data.final_feedback;
      delete data.reviewedAt;
    }
  }

  return data;
};

// CREATE SUBMISSION (Student)
const createSubmission = async (req, res) => {
  try {

    const { questionId, raw_input, structured_answer } = req.body;

    // Get question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ err: "Question not found" });
    }

    if (!question.isPublished || question.archived_at) {
      return res.status(404).json({ err: "Question not found" });
    }

    let questionVersion = question.published_version
      ? await QuestionVersion.findById(question.published_version)
      : null;

    // Backfill a baseline version on first use for questions that predate
    // versioning, so every new submission receives a concrete version link.
    if (!questionVersion) {
      questionVersion = await createQuestionVersion(
        question,
        question.created_by
      );
      question.published_version = questionVersion._id;
      await question.save();
    }

    const gradingQuestion = questionVersion || question;
    const questionSnapshot = questionVersion
      ? snapshotFromVersion(questionVersion)
      : {
          version_number: 0,
          title: question.title,
          question_text: question.question_text,
          topic: question.topic,
          level: question.level,
          model_answer: question.model_answer,
          final_answer_marks: question.final_answer_marks,
          total_marks: question.total_marks
        };

    // Grade using gradingService
    const gradingResult = gradeAnswer(structured_answer, gradingQuestion);

    // Grade using aiService
    const aiResult = await gradeWithAI(structured_answer, gradingQuestion);

    // Save submission
    const submission = await Submission.create({
      studentId: req.user.id,
      questionId,
      questionVersionId: questionVersion?._id,
      question_snapshot: questionSnapshot,
      raw_input,
      structured_answer,

      ai_score: aiResult.score,
      ai_feedback: aiResult.feedback,
      
      marks_breakdown: gradingResult.stepResults.map((step, index) => ({
        step_index: index,
        marks_awarded: step.marksAwarded || 0,
        feedback: step.correct ? "Correct" : "Incorrect"
      })),

      final_answer_correct: gradingResult.finalCorrect,
      final_score: gradingResult.score,
      final_feedback: gradingResult.feedback.join(" "),

      review_status: "ai_graded"
    });

    res.status(201).json(submissionResponse(submission, "student"));

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

// UPDATE SUBMISSION (Student)
const updateSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ err: "Submission not found" });
    }

    // Only owner can edit
    if (submission.studentId.toString() !== req.user.id) {
      return res.status(403).json({ err: "Not authorized" });
    }

    // Cannot edit after teacher review
    if (submission.review_status === "reviewed") {
      return res.status(403).json({
        err: "Cannot edit after teacher review"
      });
    }

    let question;

    if (submission.questionVersionId) {
      question = await QuestionVersion.findById(submission.questionVersionId);
    }

    if (!question && submission.question_snapshot) {
      question = submission.question_snapshot;
    }

    if (!question) {
      question = await Question.findById(submission.questionId);
    }

    if (!question) {
      return res.status(409).json({
        err: "The question version for this submission is unavailable"
      });
    }

    // Deterministic grading
    const gradingResult = gradeAnswer(req.body.structured_answer, question);

    // AI grading
    let aiResult = { score: 0, feedback: "" };

    try {
      aiResult = await gradeWithAI(req.body.structured_answer, question);
    } catch (err) {
      console.error("AI grading failed:", err.message);
    }

    //  Update fields
    submission.raw_input = req.body.raw_input || submission.raw_input;
    submission.structured_answer = req.body.structured_answer;

    // Deterministic results
    submission.marks_breakdown = gradingResult.stepResults.map((step, index) => ({
      step_index: index,
      marks_awarded: step.marksAwarded || 0,
      feedback: step.correct ? "Correct" : "Incorrect"
    }));

    submission.final_answer_correct = gradingResult.finalCorrect;

    // Scores
    submission.ai_score = aiResult.score;
    submission.ai_feedback = aiResult.feedback;

    // Decide final score strategy
    submission.final_score = gradingResult.score; 
    submission.final_feedback = aiResult.feedback;

    submission.review_status = "ai_graded";

    await submission.save();

    res.json(submissionResponse(submission, "student"));

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

// VIEW SUBMISSION (Student & Teacher; )

const getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("questionId")
      .populate("studentId", "name email");

    if (!submission) {
      return res.status(404).json({ err: "Submission not found" });
    }

    // Access control to only allow student to see their own submissions
    if (
      req.user.role === "student" &&
      submission.studentId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ err: "Not authorized" });
    }

    // Teachers can view all → no restriction

    res.json(submissionResponse(submission, req.user.role));

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

// REVIEW SUBMISSION (Teacher)

const reviewSubmission = async (req, res) => {
  try {
   
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({ err: "Submission not found" });
    }

    // Teacher sets score + feedback
    submission.teacher_score = req.body.teacher_score;
    submission.teacher_feedback = req.body.teacher_feedback;

    submission.reviewed_by = req.user.id;
    submission.reviewedAt = new Date();

    submission.review_status = "reviewed";

    // Final output (teacher overrides AI)
    submission.final_score =
      req.body.teacher_score ?? submission.ai_score;

    submission.final_feedback =
      req.body.teacher_feedback ?? submission.ai_feedback;

    await submission.save();

    res.json(submissionResponse(submission, req.user.role));

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

// View all Submissions (Student)

const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user.id })
      .populate("questionId")
      .sort({ createdAt: -1 });

    res.json(submissions.map((submission) => submissionResponse(submission, "student")));
  } catch (err) {
    console.error(err)
    res.status(500).json({ err: err.message });
  }
};

// View all Submissions (Teacher)

const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("questionId")
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.json(submissions.map((submission) => submissionResponse(submission, req.user.role)));

  } catch (err) {
    console.error(err);
    res.status(500).json({ err: err.message });
  }
};

const getPendingSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      review_status: { $ne: "reviewed" }
    })
      .populate("questionId")
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.json(submissions.map((submission) => submissionResponse(submission, req.user.role)));

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

module.exports = {
  createSubmission,
  updateSubmission,
  getSubmissionById,
  reviewSubmission,
  getMySubmissions,
  getAllSubmissions,
  getPendingSubmissions };
