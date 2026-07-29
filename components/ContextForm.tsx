"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/FormControls";
import {
  ANALYSIS_GOALS,
  GROUP_ANALYSIS_GOALS,
  RELATIONSHIP_DURATION_OPTIONS,
  RELATIONSHIPS,
  type ConversationMode,
  type RelationshipType,
} from "@/lib/context";
import { inputDraftStorage } from "@/lib/client/storage";
import { setupDraftStorage } from "@/lib/client/setup-storage";

const relationshipMeta: Record<RelationshipType, { emoji: string; description: string }> = {
  썸: { emoji: "😍", description: "관심 표현, 질문, 대화 확장" },
  연인: { emoji: "❤️", description: "공감, 변화, 갈등과 회복" },
  소개팅: { emoji: "👀", description: "초기 흐름, 후속 대화, 다음 약속" },
  "애매한 사이": { emoji: "🤨", description: "친밀감 변화, 경계, 주도권" },
  전애인: { emoji: "💔", description: "재접촉, 과거 언급, 관계 경계" },
  친구: { emoji: "🧑‍🤝‍🧑", description: "상호성, 친밀감, 연락 균형" },
};

export default function ContextForm() {
  const router = useRouter();
  const [input, setInput] = useState<ReturnType<typeof inputDraftStorage.read>>(null);
  const [mode, setMode] = useState<ConversationMode>("direct");
  const [relationship, setRelationship] = useState<RelationshipType>("썸");
  const [duration, setDuration] = useState(RELATIONSHIP_DURATION_OPTIONS.썸[1]);
  const [goal, setGoal] = useState(ANALYSIS_GOALS.썸[4]);
  const [groupGoal, setGroupGoal] = useState<string>(GROUP_ANALYSIS_GOALS[4]);

  useEffect(() => {
    const draft = inputDraftStorage.read();
    const previous = setupDraftStorage.read();
    setInput(draft);
    if (previous) {
      setMode(previous.mode); setRelationship(previous.relationship); setDuration(previous.duration); setGoal(previous.goal);
      if (previous.groupGoal) setGroupGoal(previous.groupGoal);
      return;
    }
    if (draft?.detectedMode === "group") setMode("group");
  }, []);

  const durations = useMemo(() => RELATIONSHIP_DURATION_OPTIONS[relationship], [relationship]);
  const goals = useMemo(() => ANALYSIS_GOALS[relationship], [relationship]);

  const selectRelationship = (next: RelationshipType) => {
    setRelationship(next);
    setDuration(RELATIONSHIP_DURATION_OPTIONS[next][0]);
    setGoal(ANALYSIS_GOALS[next].at(-1) ?? "전체적으로 봐주세요");
  };

  const next = () => {
    setupDraftStorage.write({
      mode,
      relationship: mode === "group" ? "친구" : relationship,
      duration: mode === "group" ? RELATIONSHIP_DURATION_OPTIONS.친구[0] : duration,
      goal: mode === "group" ? ANALYSIS_GOALS.친구.at(-1) ?? "전체적으로 봐주세요" : goal,
      groupGoal: mode === "group" ? groupGoal : undefined,
    });
    router.push("/analyze/details");
  };

  return <>
    {input?.method === "text" && input.participants.length > 0 && <div className="detected-chat-banner">
      <strong>{input.detectedMode === "group" ? `${input.participants.length}명이 참여한 단체 대화네요 👀` : "2명이 대화하고 있네요 👀"}</strong>
      <span>{input.participants.join(" · ")}</span>
    </div>}

    <section className="form-card stack conversation-mode-card">
      <div><div className="card-kicker">우사기가 먼저 본 결과</div><h2 className="form-title">이 대화는 어떤 상황인가요?</h2><p className="form-help">자동 감지 결과가 다르면 여기서 바꿀 수 있어요.</p></div>
      <div className="conversation-mode-grid">
        <button type="button" className={`conversation-mode-option ${mode === "direct" ? "selected" : ""}`} onClick={() => setMode("direct")}><strong>👤 1:1 대화</strong><small>두 사람의 흐름을 깊게 보기</small></button>
        <button type="button" className={`conversation-mode-option ${mode === "group" ? "selected" : ""}`} onClick={() => setMode("group")}><strong>👥 단체톡</strong><small>사람별 티키타카와 기류 보기</small></button>
      </div>
    </section>

    {mode === "direct" ? <>
      <div className="guide-inline"><span>🐰</span><div><strong>오... 감 잡았는데, 둘이 어떤 사이야?</strong><small>관계를 알면 같은 말도 훨씬 다르게 볼 수 있어요.</small></div></div>
      <div className="option-grid">
        {RELATIONSHIPS.map((label) => { const meta = relationshipMeta[label]; return <button type="button" key={label} className={`option ${relationship === label ? "selected" : ""}`} onClick={() => selectRelationship(label)}><span>{meta.emoji}</span><div><strong>{label}</strong><small>{meta.description}</small></div></button>; })}
      </div>
      <div className="form-card stack">
        <SelectField label="얼마나 된 사이인가요?" value={duration} options={durations} onChange={setDuration} />
        <SelectField label="무엇이 가장 궁금한가요?" value={goal} options={goals} onChange={setGoal} />
      </div>
    </> : <section className="form-card stack">
      <div><div className="card-kicker">단체톡 분석</div><h2 className="form-title">단톡에서 뭘 제일 보고 싶어요?</h2><p className="form-help">참가자별 MBTI는 받지 않고 실제 상호작용만 봅니다.</p></div>
      <SelectField label="가장 궁금한 점" value={groupGoal} options={GROUP_ANALYSIS_GOALS} onChange={setGroupGoal} />
    </section>}

    <div className="bottom-actions"><AppButton fullWidth onClick={next}>좋아, 다음 →</AppButton></div>
  </>;
}
