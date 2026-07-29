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
export type AnalysisResult = {
  id: string; createdAt: string; context: UrIsaiContext; metrics: ConversationMetrics;
  summary: string; highlights: string[]; friendComment: string;
  dataAmount: "적음" | "보통" | "충분"; extractedMessageCount: number;
};
const pct=(v:number,t:number)=>t>0?Math.round((v/t)*100):0;
const round1=(v:number)=>Math.round(v*10)/10;
function countQuestions(messages:NormalizedMessage[],speaker:Speaker){return messages.filter((m)=>m.speaker===speaker&&(/[?？]/u.test(m.text)||/(뭐|왜|어때|언제|어디|누구|어떻게|맞아|괜찮아|했어|할래|갈래|볼래|먹을래)\s*$/u.test(m.text.trim()))).length}
function consecutiveAverage(messages:NormalizedMessage[],speaker:Speaker){const runs:number[]=[];let current=0;for(const m of messages){if(m.speaker===speaker)current++;else if(current){runs.push(current);current=0}}if(current)runs.push(current);return runs.length?round1(runs.reduce((a,b)=>a+b,0)/runs.length):0}
export function calculateMetrics(messages:NormalizedMessage[]):ConversationMetrics{
  const messageCount={me:0,other:0};const characterCount={me:0,other:0};const laughterCount={me:0,other:0};const emojiLikeCount={me:0,other:0};
  for(const m of messages){const s=m.speaker;messageCount[s]++;characterCount[s]+=m.text.replace(/\s/g,"").length;laughterCount[s]+=(m.text.match(/(?:ㅋ{2,}|ㅎ{2,})/g)??[]).length;emojiLikeCount[s]+=(m.text.match(/[😀-🙏🌀-🫶❤♥♡💕💗💖💘💙💚💛🖤🤍]+/gu)??[]).length}
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
  return /[?？]/u.test(text) || /(뭐|왜|어때|언제|어디|누구|어떻게|맞아|괜찮아|했어|할래|갈래|볼래|먹을래)\s*$/u.test(text.trim());
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
    current.laughterCount += (m.text.match(/(?:ㅋ{2,}|ㅎ{2,})/g) ?? []).length;
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
