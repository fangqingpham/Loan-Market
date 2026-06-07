import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitizePublicText } from "./sanitizePublicText";

test("redacts leaked borrower note contact details", () => {
  const input =
    "contact me @647-447-0097, 6474470097, six four seven four four seven zero zero nine seven. [fangqing.pham@gmail.com](mailto:fangqing.pham@gmail.com)";

  const output = sanitizePublicText(input);

  assert.equal(
    output,
    "contact me [contact hidden], [contact hidden], [contact hidden]. [contact hidden]"
  );
  assert.doesNotMatch(output, /647/);
  assert.doesNotMatch(output, /447/);
  assert.doesNotMatch(output, /0097/);
  assert.doesNotMatch(output, /6474470097/);
  assert.doesNotMatch(output, /\[fangqing\.pham@gmail\.com\]\(mailto:fangqing\.pham@gmail\.com\)/);
  assert.doesNotMatch(output, /six four seven four four seven zero zero nine seven/i);
});

test("redacts common Canadian phone formats", () => {
  const samples = [
    "647-447-0097",
    "6474470097",
    "647 447 0097",
    "(647) 447-0097",
    "+1 647 447 0097",
  ];

  for (const sample of samples) {
    assert.equal(sanitizePublicText(sample), "[contact hidden]");
  }
});
