"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { UrIsaiContext } from "@/lib/context";
import ProcessingMascot from "@/components/ProcessingMascot";
import BrandFeature from "@/components/BrandFeature";

const stepIcons = ["stealth", "pattern", "data", "focus"] as const;

const texts = [
  "캡처에서 대화를 읽고 있습니다...",
  "두 사람의 메시지를 구분하고 있습니다...",
  "질문과 대화 균형을 계산하고 있습니다...",
  "AI 친구가 마지막 한마디를 정리하고 있습니다...",
];

export default function Processing() {
  const [idx, setIdx] = useState(0);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    controllerRef.current = controller;
    const timer = setInterval(() => setIdx((v) => Math.min(v + 1, texts.length - 1)), 1500);

    const run = async () => {
      try {
        const imagesRaw = sessionStorage.getItem("usagi-upload-images");
        const contextRaw = localStorage.getItem("urisai-context");
        const images = imagesRaw ? JSON.parse(imagesRaw) as string[] : [];
        const context = contextRaw ? JSON.parse(contextRaw) as UrIsaiContext : null;
        if (!images.length || !context) {
          router.replace(context ? "/analyze/upload" : "/analyze/context");
          return;
        }

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images, context }),
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({})) as { result?: unknown; error?: string };
        if (!response.ok || !data.result) throw new Error(data.error || "분석에 실패했습니다.");
        if (disposed || controller.signal.aborted) return;
        sessionStorage.setItem("usagi-analysis-result", JSON.stringify(data.result));
        sessionStorage.removeItem("usagi-upload-images");
        router.replace("/report");
      } catch (e) {
        if (disposed || controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "분석 중 오류가 발생했습니다.");
      }
    };

    run();
    return () => {
      disposed = true;
      controller.abort();
      clearInterval(timer);
    };
  }, [router]);

  const cancel = () => {
    if (cancelling) return;
    setCancelling(true);
    controllerRef.current?.abort();
    sessionStorage.removeItem("usagi-upload-images");
    sessionStorage.removeItem("usagi-analysis-result");
    router.replace("/analyze/upload");
  };

  if (error) {
    const missingApiKey = process.env.NODE_ENV === "development" && error.includes("OPENAI_API_KEY");
    return <div className="analysis-error">
      <div className="analysis-error-icon">{missingApiKey ? "🔑" : "😵"}</div>
      <h2>{missingApiKey ? "OpenAI API 키 설정이 필요합니다" : "분석을 완료하지 못했어요"}</h2>
      <p>{missingApiKey ? "로컬 개발 환경에서 .env.local 파일에 API 키를 설정한 뒤 개발 서버를 다시 시작해 주세요." : error}</p>
      {missingApiKey && <div className="dev-setup">
        <strong>로컬 설정 방법</strong>
        <p>프로젝트 루트에 <b>.env.local</b> 파일을 만들고 아래처럼 입력합니다. API 키는 브라우저 코드나 Git 저장소에 올리지 마세요.</p>
        <code>{`OPENAI_API_KEY=sk-여기에_본인_API_키\nOPENAI_VISION_MODEL=gpt-5-mini\nOPENAI_ANALYSIS_MODEL=gpt-5.4-nano`}</code>
        <p>저장한 뒤 실행 중인 <b>npm run dev</b>를 종료하고 다시 시작하면 적용됩니다.</p>
      </div>}
      <button className="primary" onClick={() => router.replace("/analyze/upload")}>{missingApiKey ? "설정 후 다시 시도하기" : "캡처 다시 올리기"}</button>
    </div>;
  }

  return <>
    <ProcessingMascot stage={idx} />
    <div className="steps">{texts.map((t, i) => <div className={`step ${i < idx ? "done" : i === idx ? "active" : ""}`} key={t}>
      <div className="step-dot">{i < idx ? "✓" : i + 1}</div><BrandFeature variant={stepIcons[i]} size={36} /><strong>{t}</strong>
    </div>)}</div>
    <div className="processing-actions">
      <button type="button" className="secondary cancel-analysis" onClick={cancel} disabled={cancelling}>{cancelling ? "취소 중..." : "분석 취소하기"}</button>
      <p>취소하면 남은 분석 요청을 중단합니다. 이미 AI 처리가 시작된 구간의 사용량은 발생할 수 있습니다.</p>
    </div>
  </>;
}
