import assert from "node:assert/strict";
import test from "node:test";
import { submissionErrorMessage } from "../src/utils/submissionError.js";

test("connection failures identify the failed stage and preserve edits", () => {
  const error = { code: "ERR_NETWORK" };
  assert.match(submissionErrorMessage(error, "save"), /reach the server to save your corrections/);
  assert.match(submissionErrorMessage(error, "grade"), /reach the server to submit your confirmed answer/);
  assert.match(submissionErrorMessage(error, "save"), /edits are still on this page/);
});

test("server errors retain their actionable explanation", () => {
  assert.equal(submissionErrorMessage({ response: { data: { err: "Transcript cannot be edited in its current state" } } }, "save"), "Transcript cannot be edited in its current state");
});

test("timeouts account for an uncertain submission outcome", () => {
  assert.match(submissionErrorMessage({ code: "ECONNABORTED" }, "grade"), /Check your submissions before trying again/);
});

test("non-JSON server errors expose status without rendering response bodies", () => {
  assert.match(submissionErrorMessage({ response: { status: 502, data: "<html>Bad gateway</html>" } }, "grade"), /HTTP 502/);
});
