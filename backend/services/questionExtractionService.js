const OpenAI = require("openai");
const { getQuestionImage } = require("./questionImageStorageService");

const EXTRACTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "question_text",
    "topic",
    "level",
    "model_answer",
    "final_answer_marks",
    "confidence",
    "review_notes"
  ],
  properties: {
    title: { type: "string" },
    question_text: { type: "string" },
    topic: { type: ["string", "null"], enum: ["Algebra", "Geometry", null] },
    level: { type: ["string", "null"], enum: ["Sec1", "Sec2", "Sec3", "Sec4", null] },
    model_answer: {
      type: "object",
      additionalProperties: false,
      required: ["final_answer", "steps"],
      properties: {
        final_answer: { type: "string" },
        steps: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["content", "marks"],
            properties: {
              content: { type: "string" },
              marks: { type: "integer", minimum: 1 }
            }
          }
        }
      }
    },
    final_answer_marks: { type: "integer", minimum: 1 },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    review_notes: { type: "array", items: { type: "string" } }
  }
};

const extractQuestionImage = async (
  { objectKey },
  dependencies = {}
) => {
  const image = await (dependencies.getImage || getQuestionImage)({ objectKey });
  const client = dependencies.client || new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: process.env.OPENAI_EXTRACTION_MODEL || "gpt-5-mini",
    instructions: [
      "Extract only the visible Singapore secondary-school mathematics question.",
      "Preserve mathematical notation in readable plain text or LaTeX.",
      "Create a proposed worked solution for the visible question, including a concise final answer.",
      "Suggest positive whole-number marks for each working step and for the final answer.",
      "Treat the solution and marks as an untrusted draft for human review, not an official marking scheme.",
      "Do not invent missing question text; note cropped, ambiguous, or illegible content for review.",
      "Use null for topic or level when the image does not support a confident classification.",
      "Add concise review notes for ambiguous, cropped, or illegible content."
    ].join(" "),
    input: [{
      role: "user",
      content: [
        { type: "input_text", text: "Extract this question into an editable draft." },
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
        name: "question_image_extraction",
        strict: true,
        schema: EXTRACTION_SCHEMA
      }
    }
  });

  return JSON.parse(response.output_text);
};

module.exports = { EXTRACTION_SCHEMA, extractQuestionImage };
