
export type ParsedTextMessage = {
  speaker: string;
  timestamp: string | null;
  text: string;
};

export type ParsedChatText = {
  messages: ParsedTextMessage[];
  participants: string[];
  detectedMode: "direct" | "group" | "unknown";
  parser: "kakao" | "generic";
};

const kakaoLine = /^\[(.+?)\]\s+\[(오전|오후)\s+(\d{1,2}):(\d{2})\]\s*(.*)$/;

function normalizeTime(period: string, hourRaw: string, minute: string) {
  let hour = Number(hourRaw);
  if (period === "오후" && hour !== 12) hour += 12;
  if (period === "오전" && hour === 12) hour = 0;
  return `${String(hour).padStart(2,"0")}:${minute}`;
}

export function parseKakaoText(raw: string): ParsedChatText | null {
  const lines = raw.replace(/\r/g, "").split("\n");
  const messages: ParsedTextMessage[] = [];
  let last: ParsedTextMessage | null = null;

  for (const source of lines) {
    const line = source.trim();
    if (!line) continue;
    if (/^\d{4}년\s+\d{1,2}월\s+\d{1,2}일/.test(line)) continue;

    const m = line.match(kakaoLine);
    if (m) {
      const [, speaker, period, hour, minute, text] = m;
      const msg = {
        speaker: speaker.trim(),
        timestamp: normalizeTime(period, hour, minute),
        text: text.trim(),
      };
      messages.push(msg);
      last = msg;
      continue;
    }

    // 카카오톡 복사 시 메시지 본문 줄바꿈이 이어질 수 있음.
    if (last) last.text = `${last.text}\n${line}`.trim();
  }

  if (messages.length < 2) return null;
  const participants = [...new Set(messages.map(m => m.speaker))];
  return {
    messages,
    participants,
    detectedMode: participants.length === 2 ? "direct" : participants.length >= 3 ? "group" : "unknown",
    parser: "kakao",
  };
}

export function parseGenericChatText(raw: string): ParsedChatText | null {
  const lines = raw.replace(/\r/g, "").split("\n").map(v=>v.trim()).filter(Boolean);
  const messages: ParsedTextMessage[] = [];

  for (const line of lines) {
    // 홍길동: 안녕 / 홍길동 - 안녕
    const m = line.match(/^([^:\-\[\]]{1,30})\s*[:\-]\s*(.+)$/);
    if (!m) continue;
    messages.push({ speaker: m[1].trim(), timestamp: null, text: m[2].trim() });
  }

  if (messages.length < 2) return null;
  const participants = [...new Set(messages.map(m => m.speaker))];
  return {
    messages,
    participants,
    detectedMode: participants.length === 2 ? "direct" : participants.length >= 3 ? "group" : "unknown",
    parser: "generic",
  };
}

export function parseChatText(raw: string): ParsedChatText | null {
  return parseKakaoText(raw) ?? parseGenericChatText(raw);
}
