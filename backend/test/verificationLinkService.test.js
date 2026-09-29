const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildVerificationLink,
  getFrontendUrl
} = require("../services/verificationLinkService");

test("builds a verification link from FRONTEND_URL", () => {
  const link = buildVerificationLink("token with spaces", {
    FRONTEND_URL: "https://mathmentee.example/"
  });

  assert.equal(
    link,
    "https://mathmentee.example/verify?token=token+with+spaces"
  );
});

test("trims whitespace from FRONTEND_URL", () => {
  assert.equal(buildVerificationLink("abc123", {
    FRONTEND_URL: " https://mathmentee.example "
  }), "https://mathmentee.example/verify?token=abc123");
});

test("prefers FRONTEND_URL over the legacy setting", () => {
  const frontendUrl = getFrontendUrl({
    FRONTEND_URL: "https://current.example",
    RENDER_FRONTEND_URL: "https://legacy.example"
  });

  assert.equal(frontendUrl.origin, "https://current.example");
});

test("rejects missing or unsafe frontend URLs", () => {
  assert.throws(
    () => buildVerificationLink("abc123", {}),
    /FRONTEND_URL is required/
  );
  assert.throws(
    () => buildVerificationLink("abc123", { FRONTEND_URL: "not a URL" }),
    /valid absolute URL/
  );
  assert.throws(
    () => buildVerificationLink("abc123", { FRONTEND_URL: "javascript:x" }),
    /must use http or https/
  );
});
