"use client";

import { useEffect, useMemo, useState } from "react";
import Brand from "@/components/Brand";
import BrandFeature from "@/components/BrandFeature";
import { AppButton, ButtonLink } from "@/components/ui/Button";
import { resultStorage, type StoredAnalysisResult } from "@/lib/client/storage";
import { MBTI_PROFILES, type MbtiType } from "@/lib/mbti";

type ReportResult = StoredAnalysisResult;

function ShareActions({ result }: { result: ReportResult }) {
  const ctx = result.context;
  const share = async () => {
    const standout = result.groupAnalysis?.standoutName ? `\n눈에 띈 사람: ${result.groupAnalysis.standoutName}` : "";
    const text = `우사기 분석 결과\n${result.summary}${standout}\n\n${ctx.aiFriend.name}: ${result.friendComment}`;
    if (navigator.share) await navigator.share({ title: "우사기 대화 분석", text }).catch(() => {});
    else {
      await navigator.clipboard.writeText(text).catch(() => {});
      alert("결과 요약을 복사했습니다.");
    }
  };
  return <div className="bottom-actions action-stack">
    <AppButton fullWidth onClick={share}>결과 공유하기</AppButton>
    <ButtonLink fullWidth href="/analyze">다시 분석하기</ButtonLink>
  </div>;
}

function GroupReport({ result }: { result: ReportResult }) {
  const ctx = result.context;
  const group = result.groupAnalysis;
  return <main className="shell"><div className="mobile-frame">
    <Brand/>
    <div className="report-context"><span>단체톡</span><span>{ctx.groupGoal ?? "전체적으로 봐주세요"}</span><span>{group?.participantCount ?? 0}명 감지</span></div>
    <div className="eyebrow">단체톡 분석 · {result.extractedMessageCount}개 메시지 · 데이터량 {result.dataAmount}</div>
    <h1 className="section-title">단톡에서 눈에 띈 흐름이에요 👀</h1>
    <p className="section-copy">{result.summary}</p>

    {group?.standoutName && <section className="group-standout-card">
      <div className="group-standout-kicker">🐰 우사기가 발견한 사람</div>
      <div className="group-standout-name">{group.standoutName}</div>
      <p>{group.standoutReason}</p>
    </section>}

    <section className="insight">
      <div className="insight-title"><BrandFeature variant="focus" size={42}/><strong>단톡에서 확인된 내용</strong></div>
      <div className="highlight-list">{result.highlights.map((item)=><p key={item}>{item}</p>)}</div>
    </section>

    {group && group.participantNotes.length > 0 && <section className="metric-card group-people-card">
      <div className="metric-head"><div><div className="metric-title">나와 각 사람의 대화 느낌</div><div className="metric-sub">말을 이어받는 흐름과 질문·장난을 중심으로 봅니다</div></div></div>
      <div className="group-person-list">{group.participantNotes.map((item)=><div className="group-person-row" key={`${item.name}-${item.note}`}><strong>{item.name}</strong><span>{item.note}</span></div>)}</div>
    </section>}

    <section className="friend-card">
      <div className="friend-header"><div><div className="friend-label"><BrandFeature variant="pattern" size={34}/><span>{ctx.aiFriend.name}의 한마디</span></div><div className="friend-meta">{ctx.aiFriend.ageRange} · {ctx.aiFriend.gender} · {ctx.aiFriend.mbti}</div></div><span className="friend-badge">AI 친구</span></div>
      <p className="friend-quote">“{result.friendComment}”</p>
      <div className="friend-tip">단체톡에서 보이는 상호작용을 친구 말투로 풀어낸 참고 의견입니다.</div>
    </section>

    <div className="notice result-notice">단체톡 결과는 누군가의 호감·질투·연애 감정이나 성적 지향을 판정하지 않습니다. 누가 누구의 말을 자주 이어받고 반응하는지 같은 대화 패턴만 정리합니다.</div>
    <ShareActions result={result}/>
  </div></main>;
}

export default function Report() {
  const [result,setResult]=useState<ReportResult|null>(null);
  const [mbtiFeedback,setMbtiFeedback]=useState<"similar"|"different"|null>(null);
  useEffect(() => { setResult(resultStorage.read() as ReportResult | null); }, []);
  const profile=useMemo(()=>result && result.context.mode !== "group" && result.context.other.mbti!=="모름" ? MBTI_PROFILES[result.context.other.mbti as MbtiType] : null,[result]);

  if(!result)return <main className="shell"><div className="mobile-frame"><Brand/><div className="empty-result"><h1>분석 결과가 없어요.</h1><p>대화 캡처를 먼저 올려주세요.</p><ButtonLink href="/analyze" variant="primary">분석 시작하기</ButtonLink></div></div></main>;
  if(result.context.mode === "group") return <GroupReport result={result}/>;

  const {context:ctx,metrics}=result;
  return <main className="shell"><div className="mobile-frame">
    <Brand/>
    <div className="report-context"><span>{ctx.relationship}</span><span>{ctx.duration}</span><span>{ctx.goal}</span><span>상대 {ctx.other.ageRange} · {ctx.other.gender} · {ctx.other.mbti}</span></div>
    <div className="eyebrow">대화 분석 요약 · {result.extractedMessageCount}개 메시지 · 데이터량 {result.dataAmount}</div>
    <h1 className="section-title">지금 대화에서 보이는 흐름이에요 👀</h1><p className="section-copy">{result.summary}</p>
    <section className="metric-card"><div className="metric-head"><div><div className="metric-title">대화 밸런스</div><div className="metric-sub">추출된 메시지 수 기준</div></div><strong>{metrics.messageBalance.me} : {metrics.messageBalance.other}</strong></div><div className="balance" style={{gridTemplateColumns:`${Math.max(1,metrics.messageBalance.me)}fr ${Math.max(1,metrics.messageBalance.other)}fr`}}><div/><div/></div><div className="metric-foot">나 {metrics.messageCount.me}개 · 상대 {metrics.messageCount.other}개</div></section>
    <section className="metric-card"><div className="metric-head"><div><div className="metric-title">질문 빈도</div><div className="metric-sub">대화를 이어가는 질문 표현</div></div><strong>나 {metrics.questionCount.me} · 상대 {metrics.questionCount.other}</strong></div></section>
    <section className="metric-card"><div className="metric-head"><div><div className="metric-title">평균 메시지 길이</div><div className="metric-sub">공백 제외 문자 수</div></div><strong>나 {metrics.averageMessageLength.me} · 상대 {metrics.averageMessageLength.other}</strong></div></section>
    <section className="insight"><div className="insight-title"><BrandFeature variant="focus" size={42}/><strong>대화에서 확인된 내용</strong></div><div className="highlight-list">{result.highlights.map((item)=><p key={item}>{item}</p>)}</div></section>
    <section className="friend-card"><div className="friend-header"><div><div className="friend-label"><BrandFeature variant="pattern" size={34}/><span>{ctx.aiFriend.name}의 한마디</span></div><div className="friend-meta">{ctx.aiFriend.ageRange} · {ctx.aiFriend.gender} · {ctx.aiFriend.mbti}</div></div><span className="friend-badge">AI 친구</span></div><p className="friend-quote">“{result.friendComment}”</p><div className="friend-tip">한마디는 실제 대화 지표를 바탕으로 친구 캐릭터의 말투만 입혀 표현합니다.</div></section>
    {profile&&<section className="metric-card mbti-person-card"><div className="metric-head"><div><div className="metric-title metric-title-with-icon"><BrandFeature variant="relation" size={38}/><span>{ctx.other.mbti}는 이런 편이에요</span></div><div className="metric-sub">{profile.nickname} · 일반적인 성향 참고</div></div><span className="soft-badge">{profile.group}</span></div><p className="mbti-person-copy">{profile.feature} {profile.conversationStyle}</p><div className="mbti-tag-row">{profile.strengths.map((item)=><span key={item}>{item}</span>)}</div><div className="mbti-caution"><strong>이런 모습도 이야기돼요</strong><span>{profile.cautions.join(" · ")}</span></div><p className="mbti-link-copy"><strong>이번 분석에서는</strong><br/>MBTI 자체를 감정이나 의도의 근거로 사용하지 않았습니다. 실제 대화 패턴과 성향 설명이 비슷하게 느껴지는지 참고용으로만 비교해보세요.</p><div className="mbti-feedback"><button type="button" className={mbtiFeedback==="similar"?"selected":""} onClick={()=>setMbtiFeedback("similar")}>상대랑 비슷해요</button><button type="button" className={mbtiFeedback==="different"?"selected":""} onClick={()=>setMbtiFeedback("different")}>별로 안 맞아요</button></div>{mbtiFeedback&&<div className="mbti-feedback-note">{mbtiFeedback==="similar"?"성향 설명이 실제 상대와 비슷하게 느껴지는군요. 이 선택은 현재 화면에서만 참고하며, 분석 결과 자체를 바꾸지는 않습니다.":"그럼 MBTI 설명은 가볍게 넘겨도 됩니다. 이 선택은 현재 화면에서만 참고하며, 실제 대화 패턴이 더 중요합니다."}</div>}<div className="mbti-more"><strong>{result.dataAmount==="적음"?"아직 대화가 조금 부족해요.":"평소와 비교하면 더 정확하게 볼 수 있어요."}</strong><span>다른 날의 대화나 평소 말투가 보이는 캡처를 추가하면 변화 여부를 비교하기 쉬워집니다.</span><ButtonLink href="/analyze" variant="ghost" size="sm" className="mbti-more-link">대화 더 보여주기 →</ButtonLink></div></section>}
    <div className="notice result-notice">우사기는 상대방의 마음이나 호감도를 확정하지 않습니다. 성별 조합만으로 관계나 성적 지향을 추정하지 않으며, 업로드된 대화에서 확인되는 패턴만 정리합니다.</div>
    <ShareActions result={result}/>
  </div></main>;
}
