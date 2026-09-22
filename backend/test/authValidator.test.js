const assert = require("node:assert/strict");
const test = require("node:test");

const { signupSchema } = require("../validators/authValidator");

const baseSignup = {
  name: "Aisha Tan",
  email: "aisha@example.com",
  password: "SecurePass1!"
};

test("student signup requires a selected tutor", () => {
  const { error } = signupSchema.validate({
    ...baseSignup,
    role: "student"
  });

  assert.match(error.message, /tutorId/);
});

test("student signup accepts a tutor id", () => {
  const { error } = signupSchema.validate({
    ...baseSignup,
    role: "student",
    tutorId: "507f1f77bcf86cd799439011"
  });

  assert.equal(error, undefined);
});

test("teacher signup cannot include tutor pairing", () => {
  const { error } = signupSchema.validate({
    ...baseSignup,
    role: "teacher",
    tutorId: "507f1f77bcf86cd799439011"
  });

  assert.match(error.message, /tutorId/);
});
