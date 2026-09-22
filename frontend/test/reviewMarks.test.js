import assert from "node:assert/strict";
import test from "node:test";
import { buildReviewRows, totalAwarded } from "../src/utils/reviewMarks.js";

test("review rows do not apply mismatched AI marks by array index", () => {
  const rows = buildReviewRows({
    ai_score: 13,
    questionId: {
      model_answer: {
        final_answer: "42",
        steps: [
          { content: "First step", marks: 1 },
          { content: "Second step", marks: 1 },
          { content: "Third step", marks: 1 }
        ]
      },
      final_answer_marks: 1,
      total_marks: 4
    },
    marks_breakdown: [
      { criterion: "First step", marks_awarded: 1, marks_available: 1, evidence: "", feedback: "" },
      { criterion: "Second step", marks_awarded: 1, marks_available: 1, evidence: "", feedback: "" },
      { criterion: "Combined working", marks_awarded: 11, marks_available: 11, evidence: "", feedback: "" },
      { criterion: "Final answer", marks_awarded: 1, marks_available: 1, evidence: "", feedback: "" }
    ]
  });

  assert.equal(rows[2].label, "Step 3");
  assert.equal(rows[2].marks_available, 1);
  assert.equal(rows[2].marks_awarded, 0);
  assert.equal(rows[3].marks_awarded, 1);
  assert.equal(totalAwarded(rows), 3);
});

test("review rows fall back to zero when no compatible AI row exists", () => {
  const rows = buildReviewRows({
    questionId: {
      model_answer: {
        final_answer: "42",
        steps: [{ content: "Only step", marks: 1 }]
      },
      final_answer_marks: 1,
      total_marks: 2
    },
    marks_breakdown: [
      { criterion: "Combined working", marks_awarded: 11, marks_available: 11, evidence: "", feedback: "" }
    ]
  });

  assert.equal(rows[0].marks_awarded, 0);
  assert.equal(rows[1].marks_awarded, 0);
});
