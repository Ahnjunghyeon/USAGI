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
