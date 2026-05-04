const Submission = require("../models/Submission");
const Question = require("../models/Question");
const gradeAnswer = require("../services/gradingService");
const gradeWithAI = require("../services/aiService");
const { createSubmissionSchema, updateSubmissionSchema, reviewSubmissionSchema } = require("../validators/submissionValidator");

// CREATE SUBMISSION (Student)
const createSubmission = async (req, res) => {
  try {

    const { questionId, raw_input, structured_answer } = req.body;

    // Get question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ err: "Question not found" });
    }

    // Grade using gradingService
    const gradingResult = gradeAnswer(structured_answer, question);

    // Grade using aiService
    const aiResult = await gradeWithAI(structured_answer, question);

    // Save submission
    const submission = await Submission.create({
      studentId: req.user.id,
      questionId,
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

    res.status(201).json(submission);

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

    const question = await Question.findById(submission.questionId);

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

    res.json(submission);

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

    res.json(submission);

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

module.exports = {
  createSubmission,
  updateSubmission,
  reviewSubmission
};