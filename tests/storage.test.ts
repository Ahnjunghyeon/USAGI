import test from "node:test";
import assert from "node:assert/strict";
import { isContext, isInputDraft, isStoredAnalysisResult } from "../lib/client/storage.ts";

const context = {
  mode: "direct",
  relationship: "친구",
  duration: "1년 미만",
  goal: "전체적으로 봐주세요",
  me: { ageRange: "20대 후반", gender: "선택 안 함", mbti: "모름" },
  other: { ageRange: "20대 후반", gender: "선택 안 함", mbti: "모름" },
  aiFriend: { name: "우사기", ageRange: "20대 후반", gender: "선택 안 함", mbti: "ENFP" },
};

const metrics = {
  totalMessages: 4,
  messageCount: { me: 2, other: 2 },
  messageBalance: { me: 50, other: 50 },
  questionCount: { me: 1, other: 1 },
  laughterCount: { me: 0, other: 0 },
  emojiLikeCount: { me: 0, other: 0 },
  averageMessageLength: { me: 5, other: 5 },
  consecutiveMessageAverage: { me: 1, other: 1 },
};

test("accepts a valid analysis context", () => {
  assert.equal(isContext(context), true);
});

test("rejects an invalid analysis context", () => {
  assert.equal(isContext({ ...context, mode: "unknown" }), false);
});

test("accepts a valid text input draft", () => {
  assert.equal(isInputDraft({
    method: "text",
    rawText: "나: 안녕\n상대: 반가워\n나: 오늘 뭐해?",
    participants: ["나", "상대"],
    detectedMode: "direct",
    meSpeaker: "나",
    parser: "generic",
    parserConfidence: "high",
  }), true);
});

test("rejects a malformed input draft", () => {
  assert.equal(isInputDraft({ method: "text", rawText: "", participants: "나", detectedMode: "direct" }), false);
});

test("validates a stored result including source metadata", () => {
  assert.equal(isStoredAnalysisResult({
    id: "result-1",
    createdAt: new Date().toISOString(),
    context,
    metrics,
    summary: "대화 흐름을 확인했어요.",
    highlights: ["서로 질문을 주고받았어요."],
    friendComment: "짧지만 자연스럽게 이어졌어요.",
    dataAmount: "적음",
    extractedMessageCount: 4,
    source: {
      inputType: "text",
      parser: "generic",
      confidence: "high",
      participantNames: ["나", "상대"],
      warnings: [],
    },
  }), true);
});

test("rejects invalid result source confidence", () => {
  assert.equal(isStoredAnalysisResult({
    id: "result-1",
    createdAt: new Date().toISOString(),
    context,
    metrics,
    summary: "요약",
    highlights: [],
    friendComment: "의견",
    dataAmount: "적음",
    extractedMessageCount: 2,
    source: {
      inputType: "text",
      parser: "generic",
      confidence: "certain",
      participantNames: ["나", "상대"],
      warnings: [],
    },
  }), false);
});
