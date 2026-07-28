export const MBTI_TYPES = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
] as const;

export type MbtiType = (typeof MBTI_TYPES)[number];
export type MbtiValue = MbtiType | "모름";

export type MbtiProfile = {
  group: "분석형" | "외교형" | "관리자형" | "탐험가형";
  nickname: string;
  title: string;
  feature: string;
  conversationStyle: string;
  strengths: string[];
  cautions: string[];
  friendToneHint: string;
};

export const MBTI_PROFILES: Record<MbtiType, MbtiProfile> = {
  INTJ: {
    group: "분석형", nickname: "용의주도한 전략가", title: "독립적이고 전략적인 대화",
    feature: "전체적인 구조를 보는 통찰력이 뛰어나고, 혼자 전략을 세우는 것을 편하게 느끼는 유형으로 설명됩니다.",
    conversationStyle: "감정적 위로보다 본질 파악과 효율적인 해결책을 선호하고, 장기적인 관점에서 체계적으로 대화하는 편으로 알려져 있습니다.",
    strengths: ["독립성", "비판적 사고", "문제의 근본 원인 파악"],
    cautions: ["감정 표현이 냉정하게 보일 수 있음", "상대 감정을 세심하게 읽는 데 어려움이 있을 수 있음"],
    friendToneHint: "핵심을 빠르게 짚고, 과장 없이 정리하며, 필요한 행동을 간결하게 제안합니다.",
  },
  INTP: {
    group: "분석형", nickname: "논리적인 사색가", title: "논리적이고 독창적인 대화",
    feature: "호기심이 많고 끊임없이 의문을 제기하며, 이론과 추상적인 개념을 파고드는 유형으로 설명됩니다.",
    conversationStyle: "의미 없는 잡담보다 지적이고 깊이 있는 토론을 선호하고, 독창적인 관점을 제시하는 편으로 알려져 있습니다.",
    strengths: ["창의성", "편견 없는 사고", "복잡한 문제 단순화"],
    cautions: ["일의 마무리가 약해질 수 있음", "인간관계에서 무심하게 보일 수 있음"],
    friendToneHint: "호기심 섞인 관찰과 논리적인 반박을 사용하되, 너무 장황하지 않게 말합니다.",
  },
  ENTJ: {
    group: "분석형", nickname: "대담한 통솔자", title: "목표 지향적이고 카리스마 있는 대화",
    feature: "장기적인 비전을 제시하고 사람과 일을 조직해 목표를 달성하려는 유형으로 설명됩니다.",
    conversationStyle: "비효율적인 소통을 답답해하고, 방향성과 결론이 분명한 대화를 선호하는 편으로 알려져 있습니다.",
    strengths: ["결단력", "주도성", "추진력"],
    cautions: ["지나치게 주도적으로 보일 수 있음", "비효율적인 상황에 냉정하게 반응할 수 있음"],
    friendToneHint: "직설적이되 공격적이지 않게, 결론과 다음 행동을 분명하게 말합니다.",
  },
  ENTP: {
    group: "분석형", nickname: "뜨거운 논쟁을 즐기는 변론가", title: "유머러스하고 즉흥적인 대화",
    feature: "고정관념을 깨는 것을 즐기고, 빠른 두뇌 회전으로 새로운 가능성을 탐색하는 유형으로 설명됩니다.",
    conversationStyle: "다양한 관점에서 토론하고 장난치는 것을 즐기며, 재치 있게 받아치는 편으로 알려져 있습니다.",
    strengths: ["임기응변", "다재다능함", "새로운 아이디어 탐색"],
    cautions: ["마무리가 약해질 수 있음", "논쟁 자체가 상대를 피곤하게 만들 수 있음"],
    friendToneHint: "센스 있는 농담과 빠른 받아치기를 사용하되, 사실을 비틀어 말하지 않습니다.",
  },
  INFJ: {
    group: "외교형", nickname: "선의의 옹호자", title: "깊고 철학적인 대화",
    feature: "깊은 통찰력과 뚜렷한 가치관을 중시하고, 상대의 내면을 이해하려는 유형으로 설명됩니다.",
    conversationStyle: "진심 어린 감정을 깊이 이해하려 하고 의미 있는 대화를 선호하는 편으로 알려져 있습니다.",
    strengths: ["공감 능력", "통찰력", "타인의 잠재력 발견"],
    cautions: ["속마음을 잘 드러내지 않을 수 있음", "완벽주의로 쉽게 지칠 수 있음"],
    friendToneHint: "차분하고 진중하게 맥락을 짚고, 감정을 함부로 단정하지 않습니다.",
  },
  INFP: {
    group: "외교형", nickname: "중재자", title: "감성적이고 이상적인 대화",
    feature: "내면의 가치와 도덕성을 중시하고, 감수성과 상상력이 풍부한 유형으로 설명됩니다.",
    conversationStyle: "감정을 깊이 공유하고 부드럽게 경청하며, 따뜻하게 위로하는 편으로 알려져 있습니다.",
    strengths: ["포용력", "공감", "갈등 중재"],
    cautions: ["현실 감각이 약해질 수 있음", "비판이나 갈등에 크게 상처받을 수 있음"],
    friendToneHint: "다정하게 공감한 뒤 현실적인 한마디를 덧붙입니다.",
  },
  ENFJ: {
    group: "외교형", nickname: "정의로운 사회운동가", title: "공감하고 격려하는 대화",
    feature: "타인의 성장을 돕는 데 보람을 느끼고, 따뜻함과 리더십을 함께 보이는 유형으로 설명됩니다.",
    conversationStyle: "상대의 기분과 분위기를 살피고, 적극적인 격려와 리액션을 보내는 편으로 알려져 있습니다.",
    strengths: ["사교성", "통솔력", "적극적인 공감"],
    cautions: ["타인의 문제에 지나치게 이입할 수 있음", "자신의 감정을 뒤로 미룰 수 있음"],
    friendToneHint: "따뜻하게 안심시키면서도 관계에서 필요한 행동을 분명하게 제안합니다.",
  },
  ENFP: {
    group: "외교형", nickname: "재기발랄한 활동가", title: "활발하고 감성적인 대화",
    feature: "열정과 에너지가 높고 새로운 사람과 경험에서 즐거움을 얻는 유형으로 설명됩니다.",
    conversationStyle: "감정을 솔직하게 표현하고 큰 리액션과 다양한 주제로 분위기를 밝게 만드는 편으로 알려져 있습니다.",
    strengths: ["사람을 끄는 매력", "분위기 전환", "긍정적인 에너지"],
    cautions: ["감정 기복이 커질 수 있음", "반복적인 일상에 쉽게 지루함을 느낄 수 있음"],
    friendToneHint: "밝고 친근하게 반응하며, 가벼운 농담을 섞되 과도한 확신은 피합니다.",
  },
  ISTJ: {
    group: "관리자형", nickname: "청렴결백한 논리주의자", title: "신중하고 논리적인 대화",
    feature: "전통과 규칙, 책임감을 중시하고 맡은 일을 끝까지 해내려는 유형으로 설명됩니다.",
    conversationStyle: "사실과 경험을 중심으로 본론을 체계적으로 정리하는 편으로 알려져 있습니다.",
    strengths: ["신뢰도", "정확성", "책임감"],
    cautions: ["변화에 보수적일 수 있음", "융통성이 부족하게 보일 수 있음"],
    friendToneHint: "확인된 사실과 추측을 분리해서 말하고, 현실적인 조언을 짧게 줍니다.",
  },
  ISFJ: {
    group: "관리자형", nickname: "용감한 수호자", title: "따뜻하고 배려심 있는 대화",
    feature: "조용하지만 주변 사람의 필요를 세심하게 챙기고 안정적인 관계를 중요하게 여기는 유형으로 설명됩니다.",
    conversationStyle: "상대가 불편하지 않도록 감정을 고려하고, 부드럽게 안심시키며 실질적인 도움을 주는 편으로 알려져 있습니다.",
    strengths: ["세심함", "이타성", "안정감"],
    cautions: ["거절을 어려워할 수 있음", "불만을 속으로 쌓아둘 수 있음"],
    friendToneHint: "상대의 감정을 존중하는 다정한 말투로 조심스럽게 조언합니다.",
  },
  ESTJ: {
    group: "관리자형", nickname: "엄격한 관리자", title: "직설적이고 효율적인 대화",
    feature: "명확한 기준과 질서를 중시하며, 일과 사람을 효율적으로 조직하려는 유형으로 설명됩니다.",
    conversationStyle: "목적 중심적이고 체계적이며, 문제를 빠르게 짚고 실행 가능한 해결책을 제시하는 편으로 알려져 있습니다.",
    strengths: ["실행력", "체계화", "위기 대응"],
    cautions: ["감정적 반응을 놓칠 수 있음", "엄격하거나 독단적으로 보일 수 있음"],
    friendToneHint: "핵심을 직설적으로 짚고, 지금 할 수 있는 행동을 구체적으로 제안합니다.",
  },
  ESFJ: {
    group: "관리자형", nickname: "사교적인 외교관", title: "친근하고 감정적인 대화",
    feature: "사람들과의 조화와 행복을 중요하게 여기고, 주변 분위기를 세심하게 읽는 유형으로 설명됩니다.",
    conversationStyle: "상대의 감정 변화를 빠르게 살피고, 밝은 리액션으로 친근하게 다가가는 편으로 알려져 있습니다.",
    strengths: ["협동심", "친절함", "사회적 신호 파악"],
    cautions: ["타인의 인정에 민감할 수 있음", "비판을 크게 받아들일 수 있음"],
    friendToneHint: "친근하고 리액션이 큰 말투로 분위기를 풀어주면서 조언합니다.",
  },
  ISTP: {
    group: "탐험가형", nickname: "만능 재주꾼", title: "현실적이고 간결한 대화",
    feature: "냉철한 이성과 호기심을 바탕으로 직접 경험하고 문제를 해결하는 것을 선호하는 유형으로 설명됩니다.",
    conversationStyle: "말을 길게 늘이기보다 요점을 직접 짚고 실용적인 해결을 선호하는 편으로 알려져 있습니다.",
    strengths: ["침착함", "실용성", "빠른 문제 해결"],
    cautions: ["무심하게 보일 수 있음", "장기 계획을 답답하게 느낄 수 있음"],
    friendToneHint: "말을 길게 늘이지 않고 팩트와 다음 행동만 간결하게 말합니다.",
  },
  ISFP: {
    group: "탐험가형", nickname: "호기심 많은 예술가", title: "감성적이고 조용한 대화",
    feature: "말수가 비교적 적고 다정하며, 현재의 순간과 자연스러운 조화를 중요하게 여기는 유형으로 설명됩니다.",
    conversationStyle: "감정을 중요하게 여기지만 표현은 조심스러운 편이고, 갈등 상황에서는 직접 부딪치기보다 피하려는 경향으로 설명되기도 합니다.",
    strengths: ["상대 존중", "공감", "미적 감수성", "자연스러운 조화 추구"],
    cautions: ["결정을 미룰 수 있음", "갈등을 피하려는 경향이 있을 수 있음"],
    friendToneHint: "부드럽고 조심스럽게 말을 건네되, 평소와 달라진 신호는 솔직하게 짚습니다.",
  },
  ESTP: {
    group: "탐험가형", nickname: "모험을 즐기는 사업가", title: "재치 있고 즉흥적인 대화",
    feature: "활동적이고 새로운 자극을 즐기며, 말보다 행동으로 문제를 해결하는 유형으로 설명됩니다.",
    conversationStyle: "직설적이고 장난기 있는 표현으로 긴장을 풀고, 빠르게 상황을 전환하는 편으로 알려져 있습니다.",
    strengths: ["적응력", "대담함", "직관적인 현실 대응"],
    cautions: ["장기적인 관점을 놓칠 수 있음", "충동적으로 움직일 수 있음"],
    friendToneHint: "시원하고 장난기 있게 말하되, 상대의 감정을 단정하지 않습니다.",
  },
  ESFP: {
    group: "탐험가형", nickname: "자유로운 영혼의 연예인", title: "활기차고 감정적인 대화",
    feature: "지금 이 순간의 즐거움을 중요하게 여기고, 주위 사람을 즐겁게 만드는 유형으로 설명됩니다.",
    conversationStyle: "감정을 솔직하게 표현하고 큰 리액션과 즉흥적인 제안으로 분위기를 밝게 만드는 편으로 알려져 있습니다.",
    strengths: ["사교성", "에너지", "새로운 환경 적응"],
    cautions: ["집중력이 쉽게 흐트러질 수 있음", "충동적인 선택을 할 수 있음"],
    friendToneHint: "밝고 솔직한 말투에 가벼운 농담을 섞어 친근하게 말합니다.",
  },
};

export const MBTI_GROUPS = [
  { label: "분석형 (NT)", types: ["INTJ", "INTP", "ENTJ", "ENTP"] as const },
  { label: "외교형 (NF)", types: ["INFJ", "INFP", "ENFJ", "ENFP"] as const },
  { label: "관리자형 (SJ)", types: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"] as const },
  { label: "탐험가형 (SP)", types: ["ISTP", "ISFP", "ESTP", "ESFP"] as const },
] as const;
