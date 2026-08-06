import test from "node:test";
import assert from "node:assert/strict";
import { parseChatText, parseGenericChatText, parseKakaoText } from "../lib/chat-text.ts";

test("parses Korean KakaoTalk time", () => {
  const parsed = parseKakaoText("[나] [오전 10:23] 안녕\n[상대] [오전 10:24] 안녕!");
  assert.equal(parsed?.parser, "kakao");
  assert.equal(parsed?.messages[0].timestamp, "10:23");
  assert.deepEqual(parsed?.participants, ["나", "상대"]);
});

test("parses English AM/PM after time", () => {
  const parsed = parseKakaoText("[Kim] [10:23 AM] Hello\n[Jane] [1:05 PM] Hi");
  assert.equal(parsed?.messages[1].timestamp, "13:05");
});

test("parses English AM/PM before time", () => {
  const parsed = parseKakaoText("[Kim] [AM 10:23] Hello\n[Jane] [PM 1:05] Hi");
  assert.equal(parsed?.messages[1].timestamp, "13:05");
});

test("parses 24-hour timestamps", () => {
  const parsed = parseKakaoText("[Kim] [22:03] Hello\n[Jane] [22:04] Hi");
  assert.equal(parsed?.messages[0].timestamp, "22:03");
});

test("keeps Kakao multiline continuation with the previous message", () => {
  const parsed = parseKakaoText("[나] [오전 10:23] 첫 줄\n둘째 줄\n[상대] [오전 10:24] 답장");
  assert.equal(parsed?.messages[0].text, "첫 줄\n둘째 줄");
});

test("ignores date separator lines", () => {
  const parsed = parseKakaoText("2026년 8월 6일 목요일\n[나] [오전 10:23] 안녕\n[상대] [오전 10:24] 반가워");
  assert.equal(parsed?.messages.length, 2);
});

test("parses generic name-colon chat", () => {
  const parsed = parseGenericChatText("나: 안녕\n상대: 반가워\n나: 오늘 뭐해?");
  assert.equal(parsed?.parser, "generic");
  assert.equal(parsed?.detectedMode, "direct");
});

test("parses timestamped generic chat", () => {
  const parsed = parseGenericChatText("Kim, 10:23 AM: Hello\nJane, 10:24 AM: Hi\nKim, 10:25 AM: How are you?");
  assert.equal(parsed?.messages[0].timestamp, "10:23");
});

test("rejects ordinary memo text as a conversation", () => {
  const parsed = parseGenericChatText("오늘 계획: 밥 먹기\n주의 - 늦지 않기\n장소: 서울");
  assert.equal(parsed, null);
});

test("requires at least two participants", () => {
  assert.equal(parseChatText("나: 안녕\n나: 또 안녕\n나: 마지막"), null);
});

test("parses KakaoTalk exported Korean date lines", () => {
  const parsed = parseKakaoText("2026년 8월 6일 오후 3:00, 나 : 안녕\n2026년 8월 6일 오후 3:01, 상대 : 반가워");
  assert.equal(parsed?.parser, "kakao");
  assert.equal(parsed?.messages[0].timestamp, "15:00");
  assert.deepEqual(parsed?.participants, ["나", "상대"]);
});

test("ignores participant join system messages", () => {
  const parsed = parseKakaoText("홍길동님이 들어왔습니다\n[나] [오전 10:23] 안녕\n[상대] [오전 10:24] 반가워");
  assert.equal(parsed?.messages.length, 2);
});

test("parses Japanese and Chinese localized time periods", () => {
  const japanese = parseKakaoText("[Mina] [午前 10:23] おはよう\n[Jun] [午後 1:05] こんにちは");
  const chinese = parseKakaoText("[小敏] [上午 10:23] 早上好\n[小俊] [下午 1:05] 你好");
  assert.equal(japanese?.messages[1].timestamp, "13:05");
  assert.equal(chinese?.messages[1].timestamp, "13:05");
});
