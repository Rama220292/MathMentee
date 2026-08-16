const QuestionVersion = require("../models/QuestionVersion");
const Submission = require("../models/Submission");

const versionContent = (question) => ({
  title: question.title,
  question_text: question.question_text,
  topic: question.topic,
  level: question.level,
  model_answer: {
    final_answer: question.model_answer.final_answer,
    steps: question.model_answer.steps.map((step) => ({
      content: step.content,
      marks: step.marks
    }))
  },
  final_answer_marks: question.final_answer_marks,
  total_marks: question.total_marks
});

const createQuestionVersion = async (question, createdBy) => {
  const versionNumber = (question.version_count || 0) + 1;
  const version = await QuestionVersion.create({
    question: question._id,
    version_number: versionNumber,
    ...versionContent(question),
    created_by: createdBy
  });

  await Submission.updateMany(
    {
      questionId: question._id,
      $or: [
        { questionVersionId: { $exists: false } },
        { questionVersionId: null }
      ]
    },
    {
      $set: {
        questionVersionId: version._id,
        question_snapshot: snapshotFromVersion(version)
      }
    }
  );

  question.version_count = versionNumber;
  question.current_version = version._id;
  await question.save();

  return version;
};

const snapshotFromVersion = (version) => ({
  version_number: version.version_number,
  ...versionContent(version)
});

module.exports = {
  createQuestionVersion,
  snapshotFromVersion,
  versionContent
};
