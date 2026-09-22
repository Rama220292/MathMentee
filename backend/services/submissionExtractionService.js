const OpenAI = require("openai");
const { getSubmissionImage } = require("./submissionImageStorageService");

const TRANSCRIPTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["raw_text", "steps", "final_answer", "review_notes"],
  properties: {
    raw_text: { type: "string" },
    steps: { type: "array", items: { type: "string" } },
    final_answer: { type: "string" },
    review_notes: { type: "array", items: { type: "string" } }
  }
};

const extractSubmissionImage = async (
  { objectKey, questionText },
  dependencies = {}
) => {
  const image = await (dependencies.getImage || getSubmissionImage)({ objectKey });
  const client = dependencies.client || new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-5-mini",
    instructions: [
      "Transcribe only the student's visible handwritten mathematical work.",
      "Do not solve the question, correct mistakes, add steps, or infer the expected answer.",
      "Return ordinary words as plain text and mathematical expressions as valid LaTeX.",
      "Wrap inline mathematics in \\( and \\), and displayed equations in \\[ and \\].",
      "Preserve the student's ordering and errors.",
      "Use review_notes for illegible, cropped, overwritten, or ambiguous content.",
      "Use an empty final_answer when the student did not identify one."
    ].join(" "),
    input: [{
      role: "user",
      content: [
        {
          type: "input_text",
          text: `Question context only (not an answer key): ${questionText}\nTranscribe the student's work.`
        },
        {
          type: "input_image",
          image_url: `data:${image.contentType};base64,${image.bytes.toString("base64")}`,
          detail: "high"
        }
      ]
    }],
    text: {
      format: {
        type: "json_schema",
        name: "student_handwriting_transcription",
        strict: true,
        schema: TRANSCRIPTION_SCHEMA
      }
    }
  });

  return JSON.parse(response.output_text);
};

module.exports = { TRANSCRIPTION_SCHEMA, extractSubmissionImage };
