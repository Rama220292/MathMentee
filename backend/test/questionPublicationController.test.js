const assert = require("node:assert/strict");
const test = require("node:test");

const questionModelPath = require.resolve("../models/Question");
const versionServicePath = require.resolve("../services/questionVersionService");
const controllerPath = require.resolve("../controllers/questionController");

const createResponse = () => ({
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

const loadController = (questionModel) => {
  require.cache[questionModelPath] = { exports: questionModel };
  require.cache[versionServicePath] = {
    exports: {
      async createQuestionVersion(question) {
        question.version_count = (question.version_count || 0) + 1;
        question.current_version = `version-${question.version_count}`;
        return { _id: question.current_version };
      },
      versionContent(question) {
        return question;
      }
    }
  };
  delete require.cache[controllerPath];
  return require(controllerPath);
};

test("new questions are saved ready and unpublished", async () => {
  let createdQuestion;
  const { createQuestion } = loadController({
    async create(question) {
      createdQuestion = question;
      return question;
    }
  });
  const response = createResponse();

  await createQuestion({
    user: { id: "507f1f77bcf86cd799439011" },
    body: {
      title: "Linear equation",
      question_text: "Solve 2x = 6."
    }
  }, response);

  assert.equal(response.statusCode, 201);
  assert.equal(createdQuestion.isPublished, false);
  assert.equal(createdQuestion.authoring_status, "ready");
});

test("publishes a reviewed question", async () => {
  const question = {
    _id: "507f191e810c19729de860eb",
    isPublished: false,
    authoring_status: "ready",
    current_version: "507f191e810c19729de860ec",
    async save() {}
  };
  const { setQuestionPublication } = loadController({
    findById: async () => question
  });
  const response = createResponse();

  await setQuestionPublication({
    params: { id: question._id },
    body: { isPublished: true }
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(question.isPublished, true);
  assert.equal(question.authoring_status, "published");
  assert.equal(response.body.message, "Question published successfully");
});

test("preserves a baseline version before editing a legacy published question", async () => {
  const question = {
    _id: "507f191e810c19729de860eb",
    title: "Original title",
    question_text: "Solve 2x = 6.",
    topic: "Algebra",
    level: "Sec1",
    model_answer: {
      final_answer: "x = 3",
      steps: [{ content: "Divide by 2", marks: 1 }]
    },
    final_answer_marks: 1,
    total_marks: 2,
    isPublished: true,
    authoring_status: "published",
    current_version: null,
    published_version: null,
    version_count: 0,
    async save() {}
  };
  const { updateQuestion } = loadController({
    findById: async () => question
  });
  const response = createResponse();

  await updateQuestion({
    params: { id: question._id },
    body: { title: "Corrected title" },
    user: {
      id: "507f1f77bcf86cd799439011",
      role: "content_manager"
    }
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(question.published_version, "version-1");
  assert.equal(question.current_version, "version-2");
  assert.equal(question.version_count, 2);
  assert.equal(question.title, "Corrected title");
  assert.equal(response.body.has_unpublished_changes, true);
});

test("unpublishes a published question", async () => {
  const question = {
    _id: "507f191e810c19729de860eb",
    isPublished: true,
    authoring_status: "published",
    async save() {}
  };
  const { setQuestionPublication } = loadController({
    findById: async () => question
  });
  const response = createResponse();

  await setQuestionPublication({
    params: { id: question._id },
    body: { isPublished: false }
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(question.isPublished, false);
  assert.equal(question.authoring_status, "ready");
  assert.equal(response.body.message, "Question unpublished successfully");
});

test("does not publish an unreviewed extracted draft", async () => {
  let saved = false;
  const question = {
    _id: "507f191e810c19729de860eb",
    isPublished: false,
    authoring_status: "extracted",
    async save() {
      saved = true;
    }
  };
  const { setQuestionPublication } = loadController({
    findById: async () => question
  });
  const response = createResponse();

  await setQuestionPublication({
    params: { id: question._id },
    body: { isPublished: true }
  }, response);

  assert.equal(response.statusCode, 409);
  assert.equal(saved, false);
  assert.match(response.body.err, /Review and save/);
});

test("non-content-managers list published questions only", async () => {
  let receivedFilter;
  const questions = [{ _id: "507f191e810c19729de860eb", isPublished: true }];
  const query = {
    then(resolve, reject) {
      return Promise.resolve(questions).then(resolve, reject);
    }
  };
  const { getQuestions } = loadController({
    find(filter) {
      receivedFilter = filter;
      return query;
    }
  });
  const response = createResponse();

  await getQuestions({
    user: { role: "teacher" },
    query: {}
  }, response);

  assert.deepEqual(receivedFilter, {
    isPublished: true,
    archived_at: null
  });
  assert.deepEqual(response.body, questions);
});

test("student question responses exclude answers and authoring metadata", async () => {
  const question = {
    _id: "507f191e810c19729de860eb",
    title: "Linear equation",
    question_text: "Solve 2x = 6.",
    topic: "Algebra",
    level: "Sec1",
    total_marks: 2,
    model_answer: {
      final_answer: "x = 3",
      steps: [{ content: "Divide by 2", marks: 1 }]
    },
    final_answer_marks: 1,
    authoring_status: "published",
    extraction: { provider: "openai" },
    created_by: "507f1f77bcf86cd799439011",
    isPublished: true
  };
  const query = {
    then(resolve, reject) {
      return Promise.resolve([question]).then(resolve, reject);
    }
  };
  const { getQuestions } = loadController({ find: () => query });
  const response = createResponse();

  await getQuestions({ user: { role: "student" }, query: {} }, response);

  assert.deepEqual(response.body, [{
    _id: question._id,
    title: question.title,
    question_text: question.question_text,
    topic: question.topic,
    level: question.level,
    total_marks: question.total_marks
  }]);
});

test("non-content-managers cannot fetch an unpublished question by id", async () => {
  const question = {
    _id: "507f191e810c19729de860eb",
    isPublished: false
  };
  const { getQuestionById } = loadController({
    findById() {
      return Promise.resolve(question);
    }
  });
  const response = createResponse();

  await getQuestionById({
    params: { id: question._id },
    user: { role: "student" }
  }, response);

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, { err: "Question not found" });
});

test("archives without deleting the question", async () => {
  const question = {
    _id: "507f191e810c19729de860eb",
    isPublished: true,
    authoring_status: "published",
    archived_at: null,
    async save() {}
  };
  const { setQuestionArchive } = loadController({
    findById: async () => question
  });
  const response = createResponse();

  await setQuestionArchive({
    params: { id: question._id },
    body: { archived: true },
    user: { id: "507f1f77bcf86cd799439011" }
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(question.isPublished, false);
  assert.equal(question.authoring_status, "archived");
  assert.equal(question.status_before_archive, "published");
  assert.ok(question.archived_at instanceof Date);
  assert.equal(response.body.message, "Question archived successfully");
});

test("restores an archived question as ready and unpublished", async () => {
  const question = {
    _id: "507f191e810c19729de860eb",
    isPublished: false,
    authoring_status: "archived",
    archived_at: new Date(),
    archived_by: "507f1f77bcf86cd799439011",
    status_before_archive: "published",
    async save() {}
  };
  const { setQuestionArchive } = loadController({
    findById: async () => question
  });
  const response = createResponse();

  await setQuestionArchive({
    params: { id: question._id },
    body: { archived: false },
    user: { id: "507f1f77bcf86cd799439011" }
  }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(question.isPublished, false);
  assert.equal(question.authoring_status, "ready");
  assert.equal(question.archived_at, null);
  assert.equal(response.body.message, "Question restored successfully");
});
