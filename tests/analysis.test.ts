import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateGroupParticipantMetrics,
  calculateMetrics,
  dedupeMessages,
  estimateDataAmount,
  groupToBinaryMessages,
  type GroupMessage,
  type NormalizedMessage,
} from "../lib/analysis.ts";

const sample: NormalizedMessage[] = [
  { speaker: "me", text: "오늘 뭐해?" },
  { speaker: "other", text: "영화 보려고 ㅋㅋ" },
  { speaker: "me", text: "같이 볼래? 😊" },
  { speaker: "other", text: "좋아!" },
];

test("calculates message balance", () => {
  const metrics = calculateMetrics(sample);
  assert.equal(metrics.totalMessages, 4);
  assert.deepEqual(metrics.messageCount, { me: 2, other: 2 });
  assert.deepEqual(metrics.messageBalance, { me: 50, other: 50 });
});

test("calculates question and expression counts", () => {
  const metrics = calculateMetrics(sample);
  assert.equal(metrics.questionCount.me, 2);
  assert.equal(metrics.laughterCount.other, 1);
  assert.equal(metrics.emojiLikeCount.me, 1);
});

test("deduplicates only adjacent identical messages", () => {
  const result = dedupeMessages([
    { speaker: "me", text: " 안녕 " },
    { speaker: "me", text: "안녕" },
    { speaker: "other", text: "안녕" },
  ]);
  assert.equal(result.length, 2);
});

test("estimates data amount by message count", () => {
  assert.equal(estimateDataAmount(sample), "적음");
  assert.equal(estimateDataAmount(Array.from({ length: 14 }, () => sample[0])), "보통");
  assert.equal(estimateDataAmount(Array.from({ length: 40 }, () => sample[0])), "충분");
});

test("calculates group interaction metrics", () => {
  const group: GroupMessage[] = [
    { speakerId: "me", speakerName: "나", isMe: true, text: "오늘 뭐해?" },
    { speakerId: "a", speakerName: "민지", isMe: false, text: "나 영화!" },
    { speakerId: "me", speakerName: "나", isMe: true, text: "좋겠다" },
    { speakerId: "b", speakerName: "철수", isMe: false, text: "나는 집" },
  ];
  const metrics = calculateGroupParticipantMetrics(group);
  assert.equal(metrics[0].name, "민지");
  assert.equal(metrics[0].directTurnsWithMe, 2);
});

test("converts group messages into binary messages", () => {
  const group: GroupMessage[] = [
    { speakerId: "me", speakerName: "나", isMe: true, text: "안녕" },
    { speakerId: "a", speakerName: "민지", isMe: false, text: "반가워" },
  ];
  assert.deepEqual(groupToBinaryMessages(group).map((item) => item.speaker), ["me", "other"]);
});

test("recognizes multilingual questions and laughter", () => {
  const metrics = calculateMetrics([
    { speaker: "me", text: "What are you doing" },
    { speaker: "other", text: "Nothing lol" },
    { speaker: "me", text: "今日はどう" },
    { speaker: "other", text: "哈哈" },
    { speaker: "me", text: "你在做什么" },
    { speaker: "other", text: "笑" },
  ]);
  assert.equal(metrics.questionCount.me, 3);
  assert.equal(metrics.laughterCount.other, 3);
});
