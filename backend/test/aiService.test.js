const assert = require("node:assert/strict");
const test = require("node:test");

const gradeWithAI = require("../services/aiService");
const { validateGrade } = require("../services/aiService");

test("returns a schema-validated provisional grade", async () => {
  const expected = {
    score: 2,
    feedback: "Correct method.",
    marks_breakdown: [{
      criterion: "Solve the equation",
      marks_awarded: 2,
      marks_available: 2,
      evidence: "x = 4",
      feedback: "Correct"
    }]
  };
  let request;
  const result = await gradeWithAI(
    { steps: ["2x = 8"], final_answer: "x = 4" },
    {
      question_text: "Solve 2x + 3 = 11",
      model_answer: { final_answer: "x = 4", steps: [{ content: "2x = 8", marks: 1 }] },
      final_answer_marks: 1,
      total_marks: 2
    },
    {
      client: {
        responses: {
          create: async (payload) => {
            request = payload;
            return { output_text: JSON.stringify(expected) };
          }
        }
      }
    }
  );

  assert.deepEqual(result, expected);
  assert.equal(request.text.format.schema.properties.score.maximum, 2);
});

test("rejects a score inconsistent with the marks breakdown", () => {
  assert.throws(() => validateGrade({
    score: 2,
    feedback: "",
    marks_breakdown: [{
      criterion: "Method",
      marks_awarded: 1,
      marks_available: 1,
      evidence: "",
      feedback: ""
    }]
  }, 2), /inconsistent/);
});

const retryQuestion = {
  question_text: "Solve 2x = 8",
  model_answer: { final_answer: "4", steps: [{ content: "Divide by two", marks: 1 }] },
  final_answer_marks: 1,
  total_marks: 2
};
const retryGrade = (available) => ({
  score: 1, feedback: "Check your answer",
  marks_breakdown: [{ criterion: "Method and answer", marks_awarded: 1,
    marks_available: available, evidence: "working", feedback: "Check answer" }]
});

test("retries an omitted allocation once and accepts only a consistent grade", async () => {
  let calls = 0;
  const result = await gradeWithAI({}, retryQuestion, { client: { responses: {
    create: async (request) => {
      calls += 1;
      assert.match(request.instructions, /final answer allocation/);
      if (calls === 2) assert.match(request.instructions, /failed arithmetic validation/);
      return { output_text: JSON.stringify(retryGrade(calls)) };
    }
  } } });
  assert.equal(calls, 2);
  assert.equal(result.marks_breakdown[0].marks_available, 2);
});

test("persistent inconsistent grading fails after two attempts", async () => {
  let calls = 0;
  await assert.rejects(gradeWithAI({}, retryQuestion, { client: { responses: {
    create: async () => { calls += 1; return { output_text: JSON.stringify(retryGrade(1)) }; }
  } } }), { code: "INVALID_GRADE" });
  assert.equal(calls, 2);
});

test("does not retry unrelated provider failures", async () => {
  let calls = 0;
  await assert.rejects(gradeWithAI({}, retryQuestion, { client: { responses: {
    create: async () => { calls += 1; throw new Error("Unavailable"); }
  } } }), /Unavailable/);
  assert.equal(calls, 1);
});
