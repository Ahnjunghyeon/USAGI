import type { MbtiValue } from "@/lib/mbti";
import type { AiFriendPresetId } from "@/lib/friend-presets";

export const RELATIONSHIPS = ["썸", "연인", "소개팅", "애매한 사이", "전애인", "친구"] as const;
export type RelationshipType = (typeof RELATIONSHIPS)[number];

export const AGE_RANGES = [
  "10대 후반", "20대 초반", "20대 중반", "20대 후반", "30대 초반", "30대 후반", "40대", "50대 이상",
] as const;

export const GENDERS = ["남성", "여성", "선택 안 함"] as const;

export const RELATIONSHIP_DURATION_OPTIONS: Record<RelationshipType, readonly string[]> = {
  썸: ["1주 미만", "1~4주", "1~3개월", "3개월 이상"],
  연인: ["1개월 미만", "1~6개월", "6개월~1년", "1~3년", "3년 이상"],
  소개팅: ["연락 시작 전", "1주 미만", "1~4주", "1개월 이상"],
  "애매한 사이": ["1주 미만", "1~4주", "1~3개월", "3개월 이상"],
  전애인: ["헤어진 지 1개월 미만", "1~6개월", "6개월~1년", "1년 이상"],
  친구: ["최근 알게 됨", "1년 미만", "1~3년", "3년 이상"],
};

export const ANALYSIS_GOALS: Record<RelationshipType, readonly string[]> = {
  썸: ["나한테 관심이 있는지", "내가 너무 들이대는지", "요즘 연락이 달라졌는지", "만나자고 해도 자연스러운지", "전체적으로 봐주세요"],
  연인: ["왜 분위기가 달라졌는지", "제가 뭘 잘못했는지", "싸움이 왜 길어졌는지", "대화가 한쪽으로 치우쳤는지", "전체적으로 봐주세요"],
  소개팅: ["상대가 대화를 이어가려는지", "다음 약속을 물어봐도 되는지", "제가 너무 급한지", "첫 대화 흐름이 자연스러운지", "전체적으로 봐주세요"],
  "애매한 사이": ["친구인지 썸인지", "누가 더 대화를 주도하는지", "관계가 달라지고 있는지", "제가 너무 의미를 부여하는지", "전체적으로 봐주세요"],
  전애인: ["재접촉 의도가 보이는지", "과거 감정이 반복되는지", "제가 너무 의미를 부여하는지", "연락을 이어가도 괜찮은지", "전체적으로 봐주세요"],
  친구: ["대화가 일방적인지", "요즘 멀어진 느낌이 맞는지", "서로 편한 사이인지", "제가 너무 많이 연락하는지", "전체적으로 봐주세요"],
};

export type PersonContext = {
  ageRange: string;
  gender: string;
  mbti: MbtiValue;
};

export type AiFriendContext = PersonContext & {
  name: string;
  presetId?: AiFriendPresetId;
  persona?: string;
};

export type UrIsaiContext = {
  relationship: RelationshipType;
  duration: string;
  goal: string;
  me: PersonContext;
  other: PersonContext;
  aiFriend: AiFriendContext;
};
