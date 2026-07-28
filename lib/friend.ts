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

export function buildDemoFriendComment(ctx: UrIsaiContext): string {
  const partnerMbti = mbtiContextLine(ctx);
  const presetLead = getPresetLead(ctx);

  switch (ctx.relationship) {
    case "연인":
      return `${presetLead}평소보다 대답이 확 짧아진 게 먼저 보여. ${partnerMbti}혹시 너 뭐 잘못한 거 없니?ㅋㅋ 감정부터 단정하지 말고 오늘 무슨 일 있었는지 차분하게 물어보는 게 낫겠다.`;
    case "썸":
      return `${presetLead}네가 조금 더 달리고 있긴 한데 혼자 마라톤 뛰는 정도는 아님ㅋㅋ ${partnerMbti}이번엔 상대가 먼저 공 던지는지도 한번 봐.`;
    case "소개팅":
      return `${presetLead}분위기는 나쁘지 않은데 아직 초반이잖아ㅋㅋ ${partnerMbti}다음 약속은 가볍게 한번 던져보고 반응을 보는 게 좋겠다.`;
    case "애매한 사이":
      return `${presetLead}솔직히 딱 잘라 말하긴 애매해ㅋㅋ ${partnerMbti}그래도 대화를 이어가려는 반응은 있으니까 혼자 결론부터 내리진 마.`;
    case "전애인":
      return `${presetLead}추억 얘기했다고 바로 재회각 잡지는 말자ㅋㅋ ${partnerMbti}지금 확인되는 건 대화를 받아주고 있다는 정도야.`;
    case "친구":
      return `${presetLead}서로 편하게 주고받는 흐름은 있는데 네가 질문을 조금 더 많이 하고 있네ㅋㅋ ${partnerMbti}이번엔 상대가 먼저 찾는지도 한번 봐.`;
  }
}

export function buildDemoSummary(ctx: UrIsaiContext): string {
  switch (ctx.relationship) {
    case "연인": return "현재 대화에서는 상대방이 질문에 응답하고 있지만, 평소보다 답변 길이와 대화 확장 표현이 줄어든 상황을 가정한 데모입니다.";
    case "썸": return "사용자님이 대화를 조금 더 주도하고 있지만, 상대방도 답변과 추가 반응을 통해 대화를 이어가는 상황을 가정한 데모입니다.";
    case "소개팅": return "초기 대화에서 양쪽 모두 답변을 이어가고 있으며, 다음 대화로 연결될 여지가 있는 상황을 가정한 데모입니다.";
    case "애매한 사이": return "대화는 이어지고 있지만 관계를 명확하게 판단할 직접적인 근거는 부족한 상황을 가정한 데모입니다.";
    case "전애인": return "상대방이 대화를 받아주고 있지만, 이를 재회 의도로 단정할 근거는 부족한 상황을 가정한 데모입니다.";
    case "친구": return "대화 자체는 자연스럽게 이어지고 있으나 사용자님이 질문과 대화 시작을 조금 더 많이 하는 상황을 가정한 데모입니다.";
  }
}
