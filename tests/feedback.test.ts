import test from "node:test";
import assert from "node:assert/strict";
import { isAnalysisFeedback } from "../lib/client/feedback.ts";

test("accepts valid feedback without conversation content", () => {
  assert.equal(isAnalysisFeedback({
    analysisId: "result-1", createdAt: new Date().toISOString(), rating: "partial",
    issues: ["flow", "tone"], note: "summary felt too strong", mode: "direct", inputType: "text", confidence: "medium",
  }), true);
});

test("rejects unknown rating and issue", () => {
  assert.equal(isAnalysisFeedback({ analysisId: "x", createdAt: "now", rating: "great", issues: ["raw-chat"], mode: "direct" }), false);
});
