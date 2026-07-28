import { MBTI_PROFILES, type MbtiType, type MbtiValue } from "@/lib/mbti";
import type { UrIsaiContext } from "@/lib/context";

export function getMbtiTone(mbti: MbtiValue) {
  if (mbti === "모름") return "친근하고 자연스럽게 말하되, 분석에서 확인되지 않은 감정은 단정하지 않습니다.";
  return MBTI_PROFILES[mbti as MbtiType].friendToneHint;
}

export function getFriendPersonaLabel(ctx: UrIsaiContext) {
  const { aiFriend } = ctx;
  return `${aiFriend.ageRange} · ${aiFriend.gender} · ${aiFriend.mbti}`;
}

function getPartnerLabel(ctx: UrIsaiContext) {
  if (ctx.relationship !== "연인") return "상대";
  if (ctx.other.gender === "여성") return "여자친구";
  if (ctx.other.gender === "남성") return "남자친구";
  return "연인";
}

function getPresetLead(ctx: UrIsaiContext) {
  switch (ctx.aiFriend.presetId) {
    case "mossol-uncle": return "연애는 잘 모르지만 내가 볼 땐, ";
    case "dating-aunt": return "이모가 볼 땐, ";
    default: return "내가 볼 땐, ";
  }
}

const CASUAL_MBTI_CONTEXT: Record<MbtiType, string> = {
  INTJ: "혼자 생각을 정리하고 본질부터 보려는 쪽이라, 감정 표현이 조금 차갑게 느껴질 때도 있어",
  INTP: "생각을 오래 파고드는 편이고 표현이 무심하게 보일 때도 있어서, 말이 짧다고 바로 마음이 식었다고 보긴 어려워",
  ENTJ: "결론과 방향을 분명하게 잡는 편이라, 답이 단호해도 그 자체만으로 감정이 나쁘다고 보긴 어려워",
  ENTP: "장난과 논쟁을 섞어 말하는 걸 좋아하는 편이라, 티키타카가 세 보여도 그게 꼭 갈등이라는 뜻은 아니야",
  INFJ: "속마음을 바로 다 보여주기보다 혼자 깊게 생각하는 편이라, 표현이 조용해졌다면 맥락을 같이 봐야 해",
  INFP: "감정을 깊게 받아들이고 갈등에 상처를 받을 수 있는 편이라, 말투 변화가 있다면 무엇이 서운했는지 차분히 보는 게 좋아",
  ENFJ: "상대 분위기를 많이 살피고 관계를 챙기는 편이라, 평소보다 반응이 줄었다면 그 변화 자체는 한번 눈여겨볼 만해",
  ENFP: "평소 리액션과 감정 표현이 큰 편으로 많이 얘기돼서, 원래 텐션보다 확 조용해졌다면 그 차이를 보는 게 중요해",
  ISTJ: "사실과 본론을 중요하게 보는 편이라 원래 말이 간결할 수도 있어. 그래서 평소보다 달라졌는지가 더 중요해",
  ISFJ: "상대를 배려하고 불편함을 속으로 삼키는 편으로 많이 얘기돼서, 갑자기 조용해졌다면 부담 없이 상태를 물어보는 게 좋아",
  ESTJ: "문제를 바로 짚고 해결하려는 편이라 표현이 직설적일 수 있어. 말투보다 지금 어떤 상황을 해결하려는지 같이 봐야 해",
  ESFJ: "사람 사이 분위기와 반응을 많이 보는 편이라, 평소보다 리액션이 줄었다면 관계 맥락에서 한번 체크할 만해",
  ISTP: "원래 말이 짧고 요점만 말하는 편으로 많이 얘기돼서, 단답 하나만 보고 의미를 크게 붙이면 오히려 틀릴 수 있어",
  ISFP: "감정을 중요하게 여기면서도 표현은 조심스럽고, 갈등은 직접 부딪치기보다 피하려는 편으로 많이 얘기돼",
  ESTP: "말보다 행동이 빠르고 분위기를 가볍게 넘기는 편이라, 장난스러운 답만 보고 진심을 단정하진 않는 게 좋아",
  ESFP: "평소 리액션과 감정 표현이 큰 편이라, 갑자기 텐션이 달라졌다면 그 변화가 실제로 있었는지 먼저 보는 게 좋아",
};

function mbtiContextLine(ctx: UrIsaiContext) {
  if (ctx.other.mbti === "모름") return "";
  const partner = getPartnerLabel(ctx);
  const profile = MBTI_PROFILES[ctx.other.mbti as MbtiType];
  const casual = CASUAL_MBTI_CONTEXT[ctx.other.mbti as MbtiType];
  return `${partner}가 ${ctx.other.mbti}라면 보통 ${casual}. ${profile.strengths[0]} 같은 장점도 있고 ${profile.cautions[0]} 쪽으로 보일 때도 있고. 근데 MBTI는 그냥 참고만 하고, 지금 실제 대화가 평소랑 달라졌는지를 먼저 보는 게 더 중요해. `;
}

/**
 * @deprecated Demo compatibility helper.
 * 실제 분석 결과 화면에서는 사용하지 않습니다.
 * 오래된 ReportDemo.tsx가 남아 있는 작업환경에서도 typecheck/build가 깨지지 않도록 유지합니다.
 */
export function buildDemoSummary(ctx: UrIsaiContext) {
  switch (ctx.relationship) {
    case "썸":
      return "대화는 이어지고 있지만, 현재 데모만으로 상대의 마음을 단정하기보다는 누가 질문을 이어가고 화제를 확장하는지 함께 보는 편이 좋습니다.";
    case "연인":
      return "현재 데모에서는 평소와 비교해 답변 길이와 대화 확장 표현이 달라졌는지를 우선 확인합니다. 한 장면보다 반복되는 변화가 더 중요합니다.";
    case "소개팅":
      return "초기 대화에서는 질문이 서로 오가는지, 답변이 다음 화제로 이어지는지, 후속 만남을 자연스럽게 꺼낼 흐름이 있는지를 중심으로 봅니다.";
    case "애매한 사이":
      return "대화가 계속된다는 사실과 관계가 달라지고 있다는 해석은 구분해야 합니다. 먼저 대화 주도권과 개인적인 관심 표현이 반복되는지 확인합니다.";
    case "전애인":
      return "다시 연락이 이어진다는 사실만으로 재회 의도를 단정하지 않습니다. 과거 이야기, 현재의 경계, 대화를 이어가려는 행동을 따로 살펴봅니다.";
    case "친구":
      return "친구 관계에서는 연락량 자체보다 서로 화제를 꺼내고 일상을 공유하는지가 중요합니다. 한쪽만 계속 대화를 유지하는지도 함께 봅니다.";
  }
}

function getDemoAxisStyle(mbti: MbtiValue) {
  if (mbti === "모름" || !/^[EI][NS][TF][JP]$/.test(mbti)) {
    return { judgment: "balanced", perception: "balanced" } as const;
  }
  return {
    judgment: mbti[2] === "T" ? "thinking" : "feeling",
    perception: mbti[1] === "N" ? "intuition" : "sensing",
  } as const;
}

/**
 * @deprecated Demo compatibility helper.
 * 실제 분석 한마디는 서버의 Narrative Engine에서 생성합니다.
 */
export function buildDemoFriendComment(ctx: UrIsaiContext) {
  const lead = getPresetLead(ctx);
  const axis = getDemoAxisStyle(ctx.aiFriend.mbti);
  const mbtiLine = mbtiContextLine(ctx);

  const fact = ctx.relationship === "연인"
    ? "평소보다 답이 짧아졌는지부터 보는 게 핵심이야. "
    : ctx.relationship === "전애인"
      ? "다시 답장을 받아줬다는 것과 다시 만나고 싶다는 건 다른 얘기야. "
      : "대화가 끊기지 않고 서로 질문을 주고받는 흐름은 있는 편이야. ";

  const judgment = axis.judgment === "thinking"
    ? "지금 확인되는 행동만 놓고 보면 너무 앞서 결론낼 단계는 아니고, 다음 반응을 한 번 더 확인하는 게 맞아. "
    : axis.judgment === "feeling"
      ? "괜히 신경 쓰일 만한 포인트는 있는데, 아직 한 장면만 보고 마음을 단정할 필요는 없어. "
      : "지금은 사실과 느낌을 같이 보되, 확정적으로 해석하진 않는 게 좋아. ";

  const action = axis.perception === "intuition"
    ? "너도 마음이 있다면 지금 나온 대화 소재를 살려서 가볍게 이어가 보고, 상대가 어떤 식으로 다시 받아오는지 보면 다음 흐름이 더 선명해질 거야."
    : axis.perception === "sensing"
      ? "너도 마음이 있다면 지금 대화에 실제로 나온 주제 하나를 골라 짧게 답해보고, 상대가 다시 질문하거나 화제를 이어가는지 확인해봐."
      : "너도 마음이 있다면 부담 없는 답장 하나를 보내고 다음 반응을 확인해봐.";

  return `${lead}${fact}${judgment}${mbtiLine}${action}`.replace(/\s+/g, " ").trim();
}

