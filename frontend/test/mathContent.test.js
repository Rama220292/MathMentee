import assert from "node:assert/strict";
import test from "node:test";

import {
  parseMathContent,
  serializeMathContent
} from "../src/utils/mathContent.js";

test("separates ordinary wording from inline and display equations", () => {
  assert.deepEqual(
    parseMathContent("Solve \\(x^2 = 9\\).\n\\[x = \\pm 3\\]"),
    [
      { type: "text", value: "Solve " },
      { type: "math", value: "x^2 = 9", display: false },
      { type: "text", value: ".\n" },
      { type: "math", value: "x = \\pm 3", display: true }
    ]
  );
});

test("round-trips embedded mathematics without changing stored content", () => {
  const content = "Find \\(2^3\\), then explain your answer.";
  assert.equal(serializeMathContent(parseMathContent(content)), content);
});

test("keeps legacy plain-text questions editable", () => {
  assert.deepEqual(parseMathContent("Solve 2x = 6."), [
    { type: "text", value: "Solve 2x = 6." }
  ]);
});
