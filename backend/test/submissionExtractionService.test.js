const assert = require("node:assert/strict");
const test = require("node:test");

const { extractSubmissionImage } = require("../services/submissionExtractionService");

test("transcribes handwriting with a strict schema and no answer key", async () => {
  let request;
  const expected = {
    raw_text: "2x = 8, x = 4",
    steps: ["\\(2x = 8\\)"],
    final_answer: "\\(x = 4\\)",
    review_notes: []
  };
  const result = await extractSubmissionImage(
    { objectKey: "private/answer.png", questionText: "Solve 2x + 3 = 11." },
    {
      getImage: async () => ({ bytes: Buffer.from("image"), contentType: "image/png" }),
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
  assert.equal(request.text.format.strict, true);
  const requestText = request.input[0].content[0].text;
  assert.match(requestText, /Solve 2x \+ 3 = 11/);
  assert.doesNotMatch(requestText, /model answer/i);
});
