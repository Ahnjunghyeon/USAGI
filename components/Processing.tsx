"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProcessingMascot from "@/components/ProcessingMascot";
import BrandFeature from "@/components/BrandFeature";
import { AppButton } from "@/components/ui/Button";
import { contextStorage, inputDraftStorage, resultStorage, uploadStorage } from "@/lib/client/storage";

const stepIcons = ["stealth", "pattern", "data", "focus"] as const;
const directTexts = ["대화를 읽고 있습니다...", "두 사람의 메시지를 구분하고 있습니다...", "질문과 대화 균형을 계산하고 있습니다...", "AI 친구가 핵심만 짧게 정리하고 있습니다..."];
const groupTexts = ["단체톡 대화를 읽고 있습니다...", "누가 말했는지 참가자를 구분하고 있습니다...", "나와 각 사람의 티키타카를 비교하고 있습니다...", "AI 친구가 눈에 띈 흐름만 짧게 정리하고 있습니다..."];

export default function Processing() {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"direct"|"group">("direct");
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [suggestedMode, setSuggestedMode] = useState<"direct"|"group"|null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    controllerRef.current = controller;
    const timer = setInterval(() => setIdx((v) => Math.min(v + 1, 3)), 1900);

    const run = async () => {
      try {
        const draft = inputDraftStorage.read();
        const context = contextStorage.read();
        if (context?.mode === "group") setMode("group");
        if (!context) { router.replace("/analyze/context"); return; }

        const images = draft?.method === "image" ? (uploadStorage.read() ?? []) : [];
        if (draft?.method === "image" && !images.length) { router.replace("/analyze/upload"); return; }
        if (draft?.method === "text" && !draft.rawText.trim()) { router.replace("/analyze"); return; }
        if (!draft) { router.replace("/analyze"); return; }

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images, rawText: draft.method === "text" ? draft.rawText : undefined, meSpeaker: draft.meSpeaker, context }),
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({})) as { result?: unknown; error?: string; suggestedMode?: "direct"|"group" };
        if (!response.ok || !data.result) {
          if (data.suggestedMode) setSuggestedMode(data.suggestedMode);
          throw new Error(data.error || "분석에 실패했습니다.");
        }
        if (disposed || controller.signal.aborted) return;
        resultStorage.write(data.result);
        uploadStorage.clear();
        router.replace("/report");
      } catch (e) {
        if (disposed || controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "분석 중 오류가 발생했습니다.");
      }
    };

    run();
    return () => { disposed = true; controller.abort(); clearInterval(timer); };
  }, [router]);

  const cancel = () => {
    if (cancelling) return;
    setCancelling(true);
    controllerRef.current?.abort();
    uploadStorage.clear();
    resultStorage.clear();
    router.replace("/analyze");
  };

  if (error) {
    const missingApiKey = process.env.NODE_ENV === "development" && error.includes("OPENAI_API_KEY");
    return <div className="analysis-error"><div className="analysis-error-icon">{missingApiKey ? "🔑" : "😵"}</div><h2>{missingApiKey ? "OpenAI API 키 설정이 필요합니다" : "분석을 완료하지 못했어요"}</h2><p>{missingApiKey ? "로컬 개발 환경에서 .env.local 파일에 API 키를 설정한 뒤 개발 서버를 다시 시작해 주세요." : error}</p>
      <AppButton fullWidth onClick={() => {
        if (suggestedMode) { try { contextStorage.update({ mode: suggestedMode }); } catch {} router.replace("/analyze/context"); return; }
        router.replace("/analyze");
      }}>{missingApiKey ? "설정 후 다시 시도하기" : suggestedMode ? (suggestedMode === "group" ? "단체톡 모드로 바꾸기" : "1:1 모드로 바꾸기") : "처음부터 다시 보기"}</AppButton>
    </div>;
  }

  const texts = mode === "group" ? groupTexts : directTexts;
  return <>
    <ProcessingMascot stage={idx} />
    <div className="steps">{texts.map((t, i) => <div className={`step ${i < idx ? "done" : i === idx ? "active" : ""}`} key={t}><div className="step-dot">{i < idx ? <span className="step-check" aria-label="완료">✓</span> : i + 1}</div><BrandFeature variant={stepIcons[i]} size={36} /><strong>{t}</strong></div>)}</div>
    <div className="processing-actions"><AppButton variant="secondary" fullWidth className="cancel-analysis" onClick={cancel} disabled={cancelling}>{cancelling ? "취소 중..." : "분석 취소하기"}</AppButton><p>취소하면 남은 분석 요청을 중단합니다. 이미 AI 처리가 시작된 구간의 사용량은 발생할 수 있습니다.</p></div>
  </>;
}
