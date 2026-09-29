const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { loadEnvironment } = require("../config/environment");
const { buildVerificationLink } = require("../services/verificationLinkService");

const fixture = (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "mathmentee-env-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.writeFileSync(path.join(directory, ".env"), "FRONTEND_URL=https://default.example\n");
  for (const name of ["development", "staging", "production"]) {
    fs.writeFileSync(path.join(directory, `.env.${name}`), `FRONTEND_URL=https://${name}.example\n`);
  }
  return directory;
};

test("always loads .env and builds its email link regardless of APP_ENV", (t) => {
  const directory = fixture(t);
  for (const name of [undefined, "development", "staging", "production"]) {
    const env = name ? { APP_ENV: name } : {};
    loadEnvironment({ env, directory });
    assert.equal(buildVerificationLink("abc", env), "https://default.example/verify?token=abc");
  }
});

test("host settings take precedence and work without local files", (t) => {
  const directory = fixture(t);
  const env = { APP_ENV: "production", FRONTEND_URL: "https://host.example" };
  loadEnvironment({ env, directory });
  assert.equal(env.FRONTEND_URL, "https://host.example");
  loadEnvironment({ env, directory: path.join(directory, "absent") });
  assert.equal(env.FRONTEND_URL, "https://host.example");
});

test("rejects missing or invalid frontend URLs before startup", (t) => {
  const directory = fixture(t);
  fs.unlinkSync(path.join(directory, ".env"));
  assert.throws(() => loadEnvironment({ env: {}, directory }), /FRONTEND_URL is required/);
  assert.throws(() => loadEnvironment({ env: { FRONTEND_URL: "undefined" }, directory }), /valid absolute URL/);
});
