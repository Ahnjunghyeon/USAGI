"use client";

import Link from "next/link";
import Brand from "@/components/Brand";
import { useEffect, useMemo, useState } from "react";
import type { UrIsaiContext } from "@/lib/context";
import { buildDemoFriendComment, buildDemoSummary, getFriendPersonaLabel, getMbtiTone } from "@/lib/friend";
import { MBTI_PROFILES, type MbtiType } from "@/lib/mbti";

const fallback: UrIsaiContext = {
  relationship: "썸",
  duration: "1~4주",
  goal: "전체적으로 봐주세요",
  me: { ageRange: "20대 중반", gender: "남성", mbti: "ENFP" },
  other: { ageRange: "20대 중반", gender: "여성", mbti: "ISFP" },
  aiFriend: { name: "우사기 친구", ageRange: "20대 중반", gender: "선택 안 함", mbti: "ENTP", presetId: "custom", persona: "사용자가 직접 설정한 정보와 MBTI 말투 힌트를 반영해 자연스럽게 조언합니다." },
};

const relationshipHeadline: Record<UrIsaiContext["relationship"], string> = {
  썸: "분위기는 나쁘지 않지만, 속도를 조금만 살펴보세요 👀",
  연인: "평소와 달라진 부분이 있는지 먼저 확인해보세요 👀",
  소개팅: "초기 대화 흐름은 비교적 자연스럽습니다 👀",
  "애매한 사이": "대화는 이어지지만 관계를 단정하기에는 아직 이릅니다 👀",
  전애인: "대화가 이어진다는 사실과 재회 의도는 구분해서 볼 필요가 있습니다 👀",
  친구: "대화는 자연스럽지만 연락의 균형은 확인해볼 만합니다 👀",
};

export default function ReportDemo(){
  const [ctx, setCtx] = useState<UrIsaiContext>(fallback);
  const [mbtiFeedback, setMbtiFeedback] = useState<"similar" | "different" | null>(null);
  useEffect(()=>{
    try {
      const raw = localStorage.getItem("urisai-context");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<UrIsaiContext>;
      setCtx({
        ...fallback,
        ...parsed,
        me: { ...fallback.me, ...(parsed.me ?? {}) },
        other: { ...fallback.other, ...(parsed.other ?? {}) },
        aiFriend: { ...fallback.aiFriend, ...(parsed.aiFriend ?? {}) },
      });
    } catch {}
  },[]);

  const comment = useMemo(()=>buildDemoFriendComment(ctx),[ctx]);
  const summary = useMemo(()=>buildDemoSummary(ctx),[ctx]);
  const mbtiProfile = ctx.aiFriend.mbti === "모름" ? null : MBTI_PROFILES[ctx.aiFriend.mbti as MbtiType];
  const partnerMbtiProfile = ctx.other.mbti === "모름" ? null : MBTI_PROFILES[ctx.other.mbti as MbtiType];
  const relationshipMetricLabel = ctx.relationship === "연인" ? "평소 대비 반응 변화" : ctx.relationship === "전애인" ? "대화 재접촉" : "대화 재시작";

  return <main className="shell"><div className="mobile-frame">
    <Brand badge="DEMO" />
    <div className="report-context"><span>{ctx.relationship}</span><span>{ctx.duration}</span><span>{ctx.goal}</span><span>상대 {ctx.other.ageRange} · {ctx.other.gender} · {ctx.other.mbti}</span></div>
    <div className="eyebrow">전체 분석 요약</div>
    <h1 className="section-title">{relationshipHeadline[ctx.relationship]}</h1>
    <p className="section-copy">{summary}</p>

    <section className="metric-card"><div className="metric-head"><div><div className="metric-title">대화 밸런스</div><div className="metric-sub">메시지 수 기준 데모</div></div><strong>57 : 43</strong></div><div className="balance"><div/><div/></div></section>
    <section className="metric-card"><div className="metric-head"><div><div className="metric-title">질문 빈도</div><div className="metric-sub">현재 데모 데이터</div></div><strong>나 8 · 상대 5</strong></div></section>
    <section className="metric-card"><div className="metric-head"><div><div className="metric-title">{relationshipMetricLabel}</div><div className="metric-sub">관계 유형에 따라 중요 지표가 달라집니다</div></div><strong>{ctx.relationship === "연인" ? "감소 신호" : "상대 4 / 7"}</strong></div></section>

    <div className="insight"><strong>🔍 분석에서 확인된 내용</strong><br/><br/>현재 데모에서는 실제 대화 수치와 관계 유형을 우선하여 해석합니다. 나이대와 MBTI는 맥락 설명에만 참고하며, 감정이나 호감도를 단정하는 근거로 사용하지 않습니다.</div>

    <section className="friend-card">
      <div className="friend-header"><div><div className="friend-label">🤖 {ctx.aiFriend.name}의 한마디</div><div className="friend-meta">{getFriendPersonaLabel(ctx)}</div></div><span className="friend-badge">{mbtiProfile?.group ?? "자유형"}</span></div>
      <p className="friend-quote">“{comment}”</p>
      <div className="friend-rationale"><strong>친구 말투 기준</strong>{ctx.aiFriend.persona && <span>{ctx.aiFriend.persona}</span>}<span>{getMbtiTone(ctx.aiFriend.mbti)}</span>{mbtiProfile && <span>{mbtiProfile.title}</span>}</div>
    </section>

    {partnerMbtiProfile && <section className="metric-card mbti-person-card">
      <div className="metric-head">
        <div>
          <div className="metric-title">🧩 상대방 성향도 같이 볼까요?</div>
          <div className="metric-sub">{ctx.other.mbti} · {partnerMbtiProfile.nickname}</div>
        </div>
        <span className="friend-badge">{partnerMbtiProfile.group}</span>
      </div>
      <p className="mbti-person-copy">{partnerMbtiProfile.feature} {partnerMbtiProfile.conversationStyle}</p>
      <div className="mbti-tag-row">{partnerMbtiProfile.strengths.map((item)=><span key={item}>{item}</span>)}</div>
      <p className="mbti-link-copy"><strong>이번 대화와 연결해서 보면</strong><br/>현재 데모에서는 평소보다 답변 길이와 대화 확장 표현이 줄어든 변화가 확인됩니다. 입력된 {ctx.other.mbti}의 일반적인 성향 설명과 일부 맞닿는 부분은 있지만, MBTI만으로 감정이나 의도를 단정하지 않습니다.</p>
      <div className="mbti-feedback">
        <button type="button" className={mbtiFeedback === "similar" ? "selected" : ""} onClick={()=>{setMbtiFeedback("similar"); localStorage.setItem("urisai-mbti-feedback", "similar");}}>이 설명, 비슷해요</button>
        <button type="button" className={mbtiFeedback === "different" ? "selected" : ""} onClick={()=>{setMbtiFeedback("different"); localStorage.setItem("urisai-mbti-feedback", "different");}}>별로 안 맞아요</button>
      </div>
      {mbtiFeedback && <div className="mbti-feedback-note">{mbtiFeedback === "similar" ? "실제 성향과 비슷하다고 알려주셨습니다. 다음 분석에서는 이 정보를 보조 맥락으로 참고할 수 있습니다." : "MBTI 설명이 실제 상대와 다를 수 있습니다. 다음 분석에서는 MBTI보다 대화 패턴을 더 우선해서 보겠습니다."}</div>}
      <div className="mbti-more"><strong>아니다 싶으면 더 많은 대화를 올려보세요.</strong><span>평소 대화가 함께 있으면 현재 반응이 실제로 달라진 것인지 비교하기 쉬워집니다.</span><Link href="/analyze/upload" className="mbti-more-link">대화 더 보여주기 →</Link></div>
    </section>}

    <div className="notice result-notice">AI 친구의 성격 설정은 표현 방식에만 영향을 줍니다. MBTI는 대화 맥락을 이해하기 위한 참고 정보이며, 실제 분석 결과는 대화에서 확인되는 패턴과 관계 맥락을 기준으로 산출합니다.</div>
    <div className="bottom-actions" style={{display:"grid",gap:10}}><button className="primary">이 답장 보내도 돼?</button><button className="secondary">결과 공유하기</button><Link className="secondary" style={{textAlign:"center"}} href="/">다시 분석하기</Link></div>
  </div></main>;
}
