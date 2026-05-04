const mongoose = require("mongoose")
const Question = require("../models/Question");

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
      created_by: req.user.id // from JWT
    });

    res.status(201).json(question);

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};


// GET ALL QUESTIONS
const getQuestions = async (req, res) => {
  try {
    const { topic, level } = req.query;

     let filter = {};

    if (req.user.role === "student") {
      filter.isPublished = true;
    }

    if (topic) filter.topic = topic;
    if (level) filter.level = level;

    const questions = await Question.find(filter);

    res.json(questions);

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};


// GET SINGLE QUESTION
const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ err: "Question not found" });
    }

    res.json(question);

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

    if (req.body.isPublished !== undefined) {
      question.isPublished = req.body.isPublished;
    }

    // recalculate total_marks
    const stepMarks = (question.model_answer.steps || []).reduce(
      (sum, step) => sum + (step.marks || 0),
      0
    );

    question.total_marks =
      stepMarks + (question.final_answer_marks || 0);

    await question.save();

    res.json(question);

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

// DELETE QUESTION (Teacher)
const deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);

    if (!deletedQuestion) {
      return res.status(404).json({ err: "Question not found" });
    }

    res.json({ message: "Question deleted successfully" });

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


module.exports = { createQuestion, getQuestions, getQuestionById, updateQuestion, deleteQuestion, getQuestionMeta }
