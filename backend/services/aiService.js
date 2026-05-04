const OpenAI = require("openai");
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const gradeWithAI = async (studentAnswer, question) => {
  const prompt = `
You are a math teacher.

Question:
${question.question_text}

Model Answer:
Final Answer: ${question.model_answer.final_answer}
Steps:
${question.model_answer.steps.map(s => "- " + s.content).join("\n")}

Student Answer:
Final Answer: ${studentAnswer.final_answer}
Steps:
${studentAnswer.steps.join("\n")}

Instructions:
1. Compare the student's answer with the model answer
2. Give a score out of ${question.total_marks}
3. Identify mistakes in reasoning
4. Provide constructive feedback

Respond ONLY in JSON:
{
  "score": number,
  "feedback": "string"
}
`;

  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: prompt
  });

  // Extract text safely
  const text = response.output_text;

  try {
    return JSON.parse(text);
  } catch (err) {
    return {
      score: 0,
      feedback: "AI response parsing failed"
    };
  }
};

module.exports = gradeWithAI;