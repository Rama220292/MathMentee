const assert = require("node:assert/strict");
const test = require("node:test");
const bcrypt = require("bcrypt");

const userModelPath = require.resolve("../models/User");
const emailServicePath = require.resolve("../services/emailService");
const users = [];
const emails = [];
let lookups = 0;
const password = "SecurePass1!";
const existingManager = {
  _id: "507f1f77bcf86cd799439011", email: "manager@example.com",
  role: "content_manager", isVerified: true, hashedPassword: bcrypt.hashSync(password, 4)
};
require.cache[userModelPath] = {
  exports: {
    async findOne(filter) {
      lookups += 1;
      if (filter.email === existingManager.email) return existingManager;
      if (filter._id) return { _id: filter._id, role: "teacher" };
      return null;
    },
    async create(user) { users.push(user); return user; }
  }
};
require.cache[emailServicePath] = {
  exports: { async sendVerificationEmail(...args) { emails.push(args); } }
};
const router = require("../routes/authRoutes");
const request = (method, url, body = {}) => new Promise((resolve, reject) => {
  const res = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    set() { return this; },
    json(data) { resolve({ statusCode: this.statusCode, body: data }); return this; }
  };
  router.handle({ method, url, body }, res, (error) => reject(error || new Error("Route not handled")));
});

test("content-manager signup can be disabled and re-enabled without affecting other accounts", async (t) => {
  const originalFlag = process.env.ENABLE_CONTENT_MANAGER_SIGNUP;
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "registration-test-secret";
  t.after(() => {
    if (originalFlag === undefined) delete process.env.ENABLE_CONTENT_MANAGER_SIGNUP;
    else process.env.ENABLE_CONTENT_MANAGER_SIGNUP = originalFlag;
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  });
  const signupData = { name: "New User", email: "new@example.com", password };

  for (const flag of [undefined, "false", "TRUE", "1"]) {
    if (flag === undefined) delete process.env.ENABLE_CONTENT_MANAGER_SIGNUP;
    else process.env.ENABLE_CONTENT_MANAGER_SIGNUP = flag;
    assert.deepEqual((await request("GET", "/signup-options")).body.roles, ["student", "teacher"]);
    const response = await request("POST", "/signup", { ...signupData, role: "content_manager" });
    assert.equal(response.statusCode, 403);
    assert.match(response.body.err, /currently disabled/);
    assert.equal(lookups, 0);
    assert.equal(users.length, 0);
    assert.equal(emails.length, 0);
  }

  assert.equal((await request("POST", "/signup", { ...signupData, role: "teacher" })).statusCode, 201);
  assert.equal((await request("POST", "/signup", {
    ...signupData, role: "student", tutorId: "507f1f77bcf86cd799439011"
  })).statusCode, 201);
  assert.equal(users[1].assignedTutor, "507f1f77bcf86cd799439011");

  const login = await request("POST", "/login", { email: existingManager.email, password });
  assert.equal(login.statusCode, 200);
  assert.equal(login.body.user.role, "content_manager");
  assert.ok(login.body.token);

  process.env.ENABLE_CONTENT_MANAGER_SIGNUP = "true";
  assert.deepEqual((await request("GET", "/signup-options")).body.roles, ["student", "teacher", "content_manager"]);
  assert.equal((await request("POST", "/signup", { ...signupData, role: "content_manager" })).statusCode, 201);
  assert.equal(users[2].role, "content_manager");
  assert.equal(emails.length, 3);
});
