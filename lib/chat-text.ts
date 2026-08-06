export type ParsedTextMessage = {
  speaker: string;
  timestamp: string | null;
  text: string;
};

export type ParserConfidence = "high" | "medium";

export type ParsedChatText = {
  messages: ParsedTextMessage[];
  participants: string[];
  detectedMode: "direct" | "group" | "unknown";
  parser: "kakao" | "generic";
  confidence: ParserConfidence;
  skippedLineCount: number;
  warnings: string[];
};

type TimeParts = {
  period?: string;
  hour: string;
  minute: string;
};

const MAX_SPEAKER_LENGTH = 60;
const MAX_MESSAGE_LENGTH = 4_000;

const SYSTEM_LINE_PATTERNS = [
  /^-+\s*\d{4}년\s+\d{1,2}월\s+\d{1,2}일.*-+$/u,
  /^\d{4}년\s+\d{1,2}월\s+\d{1,2}일(?:\s+\S요일)?$/u,
  /^\d{4}[./-]\d{1,2}[./-]\d{1,2}(?:\s+\S+)?$/u,
  /^(?:(?:.+?)님이 (?:들어왔습니다|나갔습니다|.+?님을 초대했습니다)|채팅방을 나갔습니다|사진|동영상|이모티콘|파일)$/u,
  /^(?:(?:.+?) (?:joined|left) the chat|you joined|left the chat|photo|video|sticker|file)$/i,
];


const KAKAO_EXPORT_PATTERNS: RegExp[] = [
  // 2026년 8월 6일 오후 3:00, 홍길동 : 안녕
  /^(?:\d{4}년\s+\d{1,2}월\s+\d{1,2}일\s+)?(오전|오후|午前|午後|上午|下午)\s*(\d{1,2}):(\d{2}),\s*(.{1,60}?)\s*:\s*(.*)$/u,
  // 2026-08-06 15:00, Kim : Hello
  /^(?:\d{4}[./-]\d{1,2}[./-]\d{1,2}\s+)?(\d{1,2}):(\d{2})\s*(AM|PM)?,\s*(.{1,60}?)\s*:\s*(.*)$/iu,
];

const KAKAO_PATTERNS: RegExp[] = [
  // [홍길동] [오전 10:23] 안녕
  /^\[(.{1,60}?)\]\s*\[(오전|오후|午前|午後|上午|下午)\s*(\d{1,2}):(\d{2})\]\s*(.*)$/u,
  // [Kim] [10:23 AM] hello / [Kim] [10:23 pm]
  /^\[(.{1,60}?)\]\s*\[(\d{1,2}):(\d{2})\s*(AM|PM)\]\s*(.*)$/iu,
  // [Kim] [AM 10:23] hello
  /^\[(.{1,60}?)\]\s*\[(AM|PM)\s*(\d{1,2}):(\d{2})\]\s*(.*)$/iu,
  // [홍길동] [22:03] 안녕
  /^\[(.{1,60}?)\]\s*\[(\d{1,2}):(\d{2})\]\s*(.*)$/u,
];

function isSystemLine(line: string) {
  return SYSTEM_LINE_PATTERNS.some((pattern) => pattern.test(line));
}

function normalizeSpeaker(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_SPEAKER_LENGTH);
}

function normalizeText(value: string) {
  return value.replace(/[ \t]+/g, " ").trim().slice(0, MAX_MESSAGE_LENGTH);
}

function normalizeTime({ period, hour: hourRaw, minute }: TimeParts) {
  let hour = Number(hourRaw);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  if (!/^\d{2}$/.test(minute) || Number(minute) > 59) return null;

  const normalizedPeriod = period?.toUpperCase();
  if (["오후", "PM", "午後", "下午"].includes(normalizedPeriod ?? "")) {
    if (hour < 12) hour += 12;
  } else if (["오전", "AM", "午前", "上午"].includes(normalizedPeriod ?? "")) {
    if (hour === 12) hour = 0;
  }

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function matchKakaoLine(line: string): ParsedTextMessage | null {
  for (let index = 0; index < KAKAO_EXPORT_PATTERNS.length; index += 1) {
    const match = line.match(KAKAO_EXPORT_PATTERNS[index]);
    if (!match) continue;

    if (index === 0) {
      const [, period, hour, minute, speaker, text] = match;
      return { speaker: normalizeSpeaker(speaker), timestamp: normalizeTime({ period, hour, minute }), text: normalizeText(text) };
    }

    const [, hour, minute, period, speaker, text] = match;
    return { speaker: normalizeSpeaker(speaker), timestamp: normalizeTime({ period, hour, minute }), text: normalizeText(text) };
  }

  for (let index = 0; index < KAKAO_PATTERNS.length; index += 1) {
    const match = line.match(KAKAO_PATTERNS[index]);
    if (!match) continue;

    if (index === 0) {
      const [, speaker, period, hour, minute, text] = match;
      return { speaker: normalizeSpeaker(speaker), timestamp: normalizeTime({ period, hour, minute }), text: normalizeText(text) };
    }
    if (index === 1) {
      const [, speaker, hour, minute, period, text] = match;
      return { speaker: normalizeSpeaker(speaker), timestamp: normalizeTime({ period, hour, minute }), text: normalizeText(text) };
    }
    if (index === 2) {
      const [, speaker, period, hour, minute, text] = match;
      return { speaker: normalizeSpeaker(speaker), timestamp: normalizeTime({ period, hour, minute }), text: normalizeText(text) };
    }

    const [, speaker, hour, minute, text] = match;
    return { speaker: normalizeSpeaker(speaker), timestamp: normalizeTime({ hour, minute }), text: normalizeText(text) };
  }
  return null;
}

function finalize(messages: ParsedTextMessage[], parser: ParsedChatText["parser"], skippedLineCount: number): ParsedChatText | null {
  const cleaned = messages.filter((message) => message.speaker && message.text);
  if (cleaned.length < 2) return null;

  const participants = [...new Set(cleaned.map((message) => message.speaker))];
  if (participants.length < 2) return null;

  const skippedRatio = skippedLineCount / Math.max(1, cleaned.length + skippedLineCount);
  const confidence: ParserConfidence = skippedRatio <= 0.15 ? "high" : "medium";
  const warnings: string[] = [];
  if (skippedLineCount > 0) warnings.push("skipped_lines");
  if (cleaned.length < 8) warnings.push("small_sample");

  return {
    messages: cleaned,
    participants,
    detectedMode: participants.length === 2 ? "direct" : participants.length >= 3 ? "group" : "unknown",
    parser,
    confidence,
    skippedLineCount,
    warnings,
  };
}

export function parseKakaoText(raw: string): ParsedChatText | null {
  const lines = raw.replace(/\r/g, "").split("\n");
  const messages: ParsedTextMessage[] = [];
  let last: ParsedTextMessage | null = null;
  let skippedLineCount = 0;
  let matchedHeaderCount = 0;

  for (const source of lines) {
    const line = source.trim();
    if (!line || isSystemLine(line)) continue;

    const message = matchKakaoLine(line);
    if (message) {
      matchedHeaderCount += 1;
      messages.push(message);
      last = message;
      continue;
    }

    // KakaoTalk copy/export can preserve line breaks inside one message.
    if (last) {
      const continuation = normalizeText(line);
      if (continuation) last.text = `${last.text}\n${continuation}`.slice(0, MAX_MESSAGE_LENGTH);
    } else {
      skippedLineCount += 1;
    }
  }

  if (matchedHeaderCount < 2) return null;
  return finalize(messages, "kakao", skippedLineCount);
}

function parseGenericLine(line: string): ParsedTextMessage | null {
  // Kim, 10:23 AM: Hello
  let match = line.match(/^(.{1,60}?),\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[:\-]\s*(.+)$/iu);
  if (match) {
    const [, speaker, hour, minute, period, text] = match;
    return {
      speaker: normalizeSpeaker(speaker),
      timestamp: normalizeTime({ hour, minute, period }),
      text: normalizeText(text),
    };
  }

  // 홍길동: 안녕 / 홍길동 - 안녕
  match = line.match(/^([^:\-\[\]]{1,60})\s*[:\-]\s*(.+)$/u);
  if (!match) return null;

  const speaker = normalizeSpeaker(match[1]);
  const text = normalizeText(match[2]);
  if (!speaker || !text) return null;
  if (/^(오늘|내일|어제|계획|주의|참고|메모|제목|내용|시간|장소)$/u.test(speaker)) return null;
  return { speaker, timestamp: null, text };
}

export function parseGenericChatText(raw: string): ParsedChatText | null {
  const lines = raw.replace(/\r/g, "").split("\n");
  const messages: ParsedTextMessage[] = [];
  let skippedLineCount = 0;

  for (const source of lines) {
    const line = source.trim();
    if (!line || isSystemLine(line)) continue;
    const message = parseGenericLine(line);
    if (message) messages.push(message);
    else skippedLineCount += 1;
  }

  // Generic parsing is intentionally stricter to avoid reading ordinary notes as a chat.
  const participants = [...new Set(messages.map((message) => message.speaker))];
  const repeatedSpeaker = participants.some((speaker) => messages.filter((message) => message.speaker === speaker).length >= 2);
  if (messages.length < 3 || participants.length < 2 || !repeatedSpeaker) return null;

  return finalize(messages, "generic", skippedLineCount);
}

export function parseChatText(raw: string): ParsedChatText | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return parseKakaoText(trimmed) ?? parseGenericChatText(trimmed);
}
