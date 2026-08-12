const assert = require("node:assert/strict");
const test = require("node:test");

const { extractQuestionImage } = require("../services/questionExtractionService");

test("sends a private image and requests a reviewable worked answer", async () => {
  let request;
  const result = await extractQuestionImage({ objectKey: "private/question.png" }, {
    getImage: async () => ({ bytes: Buffer.from("image-bytes"), contentType: "image/png" }),
    client: { responses: { create: async (payload) => {
      request = payload;
      return { output_text: JSON.stringify({
        title: "Linear equation", question_text: "Solve 2x = 6.",
        topic: "Algebra", level: "Sec1",
        model_answer: {
          final_answer: "x = 3",
          steps: [{ content: "Divide both sides by 2.", marks: 1 }]
        },
        final_answer_marks: 1,
        confidence: 0.95, review_notes: []
      }) };
    } } }
  });

  assert.equal(result.question_text, "Solve 2x = 6.");
  assert.match(request.input[0].content[1].image_url, /^data:image\/png;base64,/);
  assert.equal(request.text.format.type, "json_schema");
  assert.equal(result.model_answer.final_answer, "x = 3");
  assert.equal(result.final_answer_marks, 1);
  assert.equal(request.text.format.schema.properties.model_answer.type, "object");
  assert.match(request.instructions, /proposed worked solution/);
  assert.match(request.instructions, /human review/);
});
