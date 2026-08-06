import type { UrIsaiContext } from "@/lib/context";

export type Speaker = "me" | "other";
export type NormalizedMessage = { speaker: Speaker; text: string; timestamp?: string | null };
export type ConversationMetrics = {
  totalMessages: number;
  messageCount: Record<Speaker, number>;
  messageBalance: Record<Speaker, number>;
  questionCount: Record<Speaker, number>;
  questionRatio: Record<Speaker, number>;
  characterCount: Record<Speaker, number>;
  averageMessageLength: Record<Speaker, number>;
  consecutiveMessageAverage: Record<Speaker, number>;
  laughterCount: Record<Speaker, number>;
  emojiLikeCount: Record<Speaker, number>;
};
export type AnalysisSource = {
  inputType: "text" | "image";
  parser: "kakao" | "generic" | "vision";
  confidence: "high" | "medium" | "low";
  participantNames: string[];
  meBubbleSide?: "right" | "left" | "auto" | "unclear";
  warnings: string[];
};

export type AnalysisResult = {
  id: string;
  createdAt: string;
  context: UrIsaiContext;
  metrics: ConversationMetrics;
  summary: string;
  highlights: string[];
  friendComment: string;
  dataAmount: "적음" | "보통" | "충분";
  extractedMessageCount: number;
  source?: AnalysisSource;
};
const pct=(v:number,t:number)=>t>0?Math.round((v/t)*100):0;
const round1=(v:number)=>Math.round(v*10)/10;
const LAUGHTER_PATTERN=/(?:ㅋ{2,}|ㅎ{2,}|\b(?:lol|lmao|rofl)\b|ha(?:ha)+|he(?:he)+|w{2,}|笑+|哈{2,}|呵{2,}|嘿{2,})/giu;
function isQuestionText(text:string){
  const trimmed=text.trim();
  if(/[?？]/u.test(trimmed))return true;
  if(/(뭐|왜|어때|언제|어디|누구|어떻게|맞아|괜찮아|했어|할래|갈래|볼래|먹을래)\s*$/u.test(trimmed))return true;
  if(/^(?:who|what|why|when|where|how|do|does|did|are|is|was|were|can|could|would|will|should)\b/iu.test(trimmed))return true;
  if(/(?:ですか|ますか|なの|のかな|かな|どう|なに|何|いつ|どこ|誰|なぜ|なんで)[。！!]*$/u.test(trimmed))return true;
  return /(?:吗|嗎|呢|什么|什麼|为什么|為什麼|怎么|怎麼|谁|誰|哪(?:里|裡)?|什么时候|什麼時候)[。！!]*$/u.test(trimmed);
}
function countLaughter(text:string){return(text.match(LAUGHTER_PATTERN)??[]).length}
function countQuestions(messages:NormalizedMessage[],speaker:Speaker){return messages.filter((m)=>m.speaker===speaker&&isQuestionText(m.text)).length}
function consecutiveAverage(messages:NormalizedMessage[],speaker:Speaker){const runs:number[]=[];let current=0;for(const m of messages){if(m.speaker===speaker)current++;else if(current){runs.push(current);current=0}}if(current)runs.push(current);return runs.length?round1(runs.reduce((a,b)=>a+b,0)/runs.length):0}
export function calculateMetrics(messages:NormalizedMessage[]):ConversationMetrics{
  const messageCount={me:0,other:0};const characterCount={me:0,other:0};const laughterCount={me:0,other:0};const emojiLikeCount={me:0,other:0};
  for(const m of messages){const s=m.speaker;messageCount[s]++;characterCount[s]+=m.text.replace(/\s/g,"").length;laughterCount[s]+=countLaughter(m.text);emojiLikeCount[s]+=(m.text.match(/[😀-🙏🌀-🫶❤♥♡💕💗💖💘💙💚💛🖤🤍]+/gu)??[]).length}
  const totalMessages=messageCount.me+messageCount.other;const questionCount={me:countQuestions(messages,"me"),other:countQuestions(messages,"other")};
  return {totalMessages,messageCount,messageBalance:{me:pct(messageCount.me,totalMessages),other:pct(messageCount.other,totalMessages)},questionCount,questionRatio:{me:messageCount.me?pct(questionCount.me,messageCount.me):0,other:messageCount.other?pct(questionCount.other,messageCount.other):0},characterCount,averageMessageLength:{me:messageCount.me?round1(characterCount.me/messageCount.me):0,other:messageCount.other?round1(characterCount.other/messageCount.other):0},consecutiveMessageAverage:{me:consecutiveAverage(messages,"me"),other:consecutiveAverage(messages,"other")},laughterCount,emojiLikeCount};
}
export function estimateDataAmount(messages:NormalizedMessage[]):AnalysisResult["dataAmount"]{if(messages.length>=40)return"충분";if(messages.length>=14)return"보통";return"적음"}

export function dedupeMessages(messages:NormalizedMessage[]):NormalizedMessage[]{const result:NormalizedMessage[]=[];for(const message of messages){const text=message.text.trim().replace(/\s+/g," ");if(!text)continue;const previous=result[result.length-1];if(previous&&previous.speaker===message.speaker&&previous.text.trim().replace(/\s+/g," ")===text&&(previous.timestamp??null)===(message.timestamp??null))continue;result.push({...message,text})}return result}


export type GroupMessage = {
  speakerId: string;
  speakerName: string;
  isMe: boolean;
  text: string;
  timestamp?: string | null;
};

export type GroupParticipantMetric = {
  speakerId: string;
  name: string;
  messageCount: number;
  questionCount: number;
  laughterCount: number;
  respondsAfterMe: number;
  meRespondsAfterThem: number;
  directTurnsWithMe: number;
  interactionScore: number;
};

export type GroupAnalysis = {
  participantCount: number;
  participants: GroupParticipantMetric[];
  standoutName: string | null;
  standoutReason: string;
  participantNotes: { name: string; note: string }[];
};

export type GroupAwareAnalysisResult = AnalysisResult & {
  groupAnalysis?: GroupAnalysis;
};

function groupQuestion(text: string) {
  return isQuestionText(text);
}

export function calculateGroupParticipantMetrics(messages: GroupMessage[]): GroupParticipantMetric[] {
  const byId = new Map<string, GroupParticipantMetric>();
  for (const m of messages) {
    if (m.isMe) continue;
    const current = byId.get(m.speakerId) ?? {
      speakerId: m.speakerId,
      name: m.speakerName || "이름 미상",
      messageCount: 0,
      questionCount: 0,
      laughterCount: 0,
      respondsAfterMe: 0,
      meRespondsAfterThem: 0,
      directTurnsWithMe: 0,
      interactionScore: 0,
    };
    current.messageCount += 1;
    if (groupQuestion(m.text)) current.questionCount += 1;
    current.laughterCount += countLaughter(m.text);
    byId.set(m.speakerId, current);
  }

  for (let i = 1; i < messages.length; i += 1) {
    const prev = messages[i - 1];
    const cur = messages[i];
    if (prev.isMe && !cur.isMe) {
      const metric = byId.get(cur.speakerId);
      if (metric) {
        metric.respondsAfterMe += 1;
        metric.directTurnsWithMe += 1;
      }
    } else if (!prev.isMe && cur.isMe) {
      const metric = byId.get(prev.speakerId);
      if (metric) {
        metric.meRespondsAfterThem += 1;
        metric.directTurnsWithMe += 1;
      }
    }
  }

  for (const metric of byId.values()) {
    metric.interactionScore =
      metric.directTurnsWithMe * 3 +
      Math.min(metric.questionCount, 5) * 2 +
      Math.min(metric.laughterCount, 4);
  }

  return [...byId.values()].sort((a, b) =>
    b.interactionScore - a.interactionScore || b.messageCount - a.messageCount
  );
}

export function groupToBinaryMessages(messages: GroupMessage[]): NormalizedMessage[] {
  return messages.map((m) => ({
    speaker: m.isMe ? "me" : "other",
    text: m.text,
    timestamp: m.timestamp ?? null,
  }));
}
