const assert = require("node:assert/strict");
const test = require("node:test");
const jwt = require("jsonwebtoken");

// Exercise the real router, authentication, role checks and Joi validation.
// Stub controller work to avoid MongoDB, S3 and extraction-provider calls.
const controllerPath = require.resolve("../controllers/questionController");
const actions = [
  ["POST", "/", "createQuestion", {
    title: "Equation", question_text: "Solve 2x = 6", topic: "Algebra", level: "Sec1",
    model_answer: { final_answer: "x = 3", steps: [{ content: "Divide by 2", marks: 1 }] },
    final_answer_marks: 1
  }],
  ["PUT", "/507f191e810c19729de860eb", "updateQuestion", { title: "Updated equation" }],
  ["PATCH", "/507f191e810c19729de860eb/publication", "setQuestionPublication", { isPublished: true }],
  ["PATCH", "/507f191e810c19729de860eb/archive", "setQuestionArchive", { archived: true }],
  ["POST", "/image-upload-requests", "createQuestionImageUploadRequest", {
    filename: "question.png", contentType: "image/png", size: 1234
  }],
  ["POST", "/image-upload-confirmations", "confirmQuestionImageUpload", { uploadId: "507f191e810c19729de860ea" }],
  ["POST", "/507f191e810c19729de860eb/extractions", "extractQuestionDraft", undefined]
];
require.cache[controllerPath] = {
  exports: Object.fromEntries([
    ...actions.map(([, , action]) => action),
    "getQuestions", "getQuestionMeta", "getQuestionById"
  ].map((action) => [action, (req, res) => res.json({ action, role: req.user.role })]))
};
const router = require("../routes/questionRoutes");

const request = (method, url, body, role) => new Promise((resolve, reject) => {
  const token = role && jwt.sign({ id: "507f1f77bcf86cd799439011", role }, process.env.JWT_SECRET);
  const req = { method, url, body, headers: token ? { authorization: `Bearer ${token}` } : {} };
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(data) { resolve({ statusCode: this.statusCode, body: data }); return this; }
  };
  router.handle(req, res, (error) => reject(error || new Error("Route not handled")));
});

test("question authoring endpoints accept teachers and content managers and reject students", async (t) => {
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "question-permissions-test-secret";
  t.after(() => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  });

  for (const [method, url, action, body] of actions) {
    for (const role of ["teacher", "content_manager"]) {
      const response = await request(method, url, body, role);
      assert.equal(response.statusCode, 200, `${role}: ${action}`);
      assert.deepEqual(response.body, { action, role });
    }
    assert.equal((await request(method, url, body, "student")).statusCode, 403, action);
    assert.equal((await request(method, url, body)).statusCode, 401, action);
  }
});
