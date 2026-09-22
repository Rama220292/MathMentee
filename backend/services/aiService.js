const OpenAI = require("openai");

const gradingSchema = (totalMarks) => ({
  type: "object",
  additionalProperties: false,
  required: ["score", "feedback", "marks_breakdown"],
  properties: {
    score: { type: "number", minimum: 0, maximum: totalMarks },
    feedback: { type: "string" },
    marks_breakdown: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["criterion", "marks_awarded", "marks_available", "evidence", "feedback"],
        properties: {
          criterion: { type: "string" },
          marks_awarded: { type: "number", minimum: 0 },
          marks_available: { type: "number", minimum: 0 },
          evidence: { type: "string" },
          feedback: { type: "string" }
        }
      }
    }
  }
});

const validateGrade = (result, totalMarks) => {
  let available = 0;
  const awarded = result.marks_breakdown.reduce((sum, item) => {
    if (item.marks_awarded > item.marks_available) {
      throw Object.assign(new Error("AI grading awarded more marks than a criterion allows"), { code: "INVALID_GRADE" });
    }
    available += item.marks_available;
    return sum + item.marks_awarded;
  }, 0);

  if (
    result.score < 0
    || result.score > totalMarks
    || Math.abs(awarded - result.score) > 0.001
    || Math.abs(available - totalMarks) > 0.001
  ) {
    throw Object.assign(new Error("AI grading score is inconsistent with its marks breakdown"), { code: "INVALID_GRADE" });
  }

  return result;
};

const gradeWithAI = async (studentAnswer, question, dependencies = {}) => {
  const client = dependencies.client || new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const request = {
    model: process.env.OPENAI_GRADING_MODEL || "gpt-5-mini",
    instructions: [
      "Act as a Singapore secondary-school mathematics marker.",
      "Award marks only against the supplied marking scheme and maximum marks.",
      "Credit valid reasoning even when wording differs from the model answer.",
      "Do not award more than the marks available for a criterion.",
      "Include every marking criterion, including criteria awarded zero marks and the final answer allocation.",
      "The sum of marks_available must equal total_marks; do not omit or double-count allocations.",
      "The score must equal the sum of marks_awarded. Check both sums before responding.",
      "Cite brief evidence from the student's confirmed answer for each criterion.",
      "Give concise, constructive feedback. This result is provisional until tutor review."
    ].join(" "),
    input: JSON.stringify({
      question: question.question_text,
      model_answer: question.model_answer,
      final_answer_marks: question.final_answer_marks,
      total_marks: question.total_marks,
      student_answer: studentAnswer
    }),
    text: {
      format: {
        type: "json_schema",
        name: "student_answer_grade",
        strict: true,
        schema: gradingSchema(question.total_marks)
      }
    }
  };

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await client.responses.create(request);
    try {
      return validateGrade(JSON.parse(response.output_text), question.total_marks);
    } catch (error) {
      if (error.code !== "INVALID_GRADE" || attempt === 1) throw error;
      request.instructions += ` Your previous result failed arithmetic validation. Return a fresh complete breakdown with available marks summing to ${question.total_marks} and awarded marks summing exactly to score.`;
    }
  }
};

module.exports = gradeWithAI;
module.exports.gradingSchema = gradingSchema;
module.exports.validateGrade = validateGrade;
