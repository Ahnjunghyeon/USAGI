"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProcessingMascot from "@/components/ProcessingMascot";
import BrandFeature from "@/components/BrandFeature";
import { AppButton } from "@/components/ui/Button";
import { contextStorage, inputDraftStorage, resultStorage, uploadStorage } from "@/lib/client/storage";
import { useLocale } from "@/components/LocaleProvider";

const stepIcons = ["stealth", "pattern", "data", "focus"] as const;

type ApiPayload = {
  result?: unknown;
  error?: string;
  suggestedMode?: "direct" | "group";
  status?: string;
  code?: string;
  retryAfter?: number;
};

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
}

export default function Processing() {
  const [idx, setIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [suggestedMode, setSuggestedMode] = useState<"direct" | "group" | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const requestStartedRef = useRef(false);
  const router = useRouter();
  const { t, locale, ready } = useLocale();

  // 진행 연출은 API 요청 생명주기와 분리합니다.
  // React Strict Mode가 요청 effect를 재실행하더라도 단계 타이머는 정상적으로 다시 구성됩니다.
  useEffect(() => {
    if (!ready) return;

    const draft = inputDraftStorage.read();
    const isImage = draft?.method === "image";
    const schedule = isImage
      ? [1800, 4300, 7600]
      : [900, 2200, 3900];

    setIdx(0);
    setElapsed(0);

    const stageTimers = schedule.map((delay, index) =>
      window.setTimeout(() => setIdx(index + 1), delay),
    );
    const elapsedTimer = window.setInterval(() => setElapsed((value) => value + 1), 1000);

    return () => {
      stageTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearInterval(elapsedTimer);
    };
  }, [ready]);

  useEffect(() => {
    if (!ready || requestStartedRef.current) return;
    requestStartedRef.current = true;

    let disposed = false;
    const controller = new AbortController();
    controllerRef.current = controller;

    const draft = inputDraftStorage.read();
    const analysisLocale = locale;

    const run = async () => {
      try {
        const context = contextStorage.read();
        if (context?.mode === "group") setMode("group");
        if (!context) {
          router.replace("/analyze/context");
          return;
        }
        if (!draft) {
          router.replace("/analyze");
          return;
        }

        const images = draft.method === "image" ? (uploadStorage.read() ?? []) : [];
        if (draft.method === "image" && !images.length) {
          router.replace("/analyze/upload");
          return;
        }
        if (draft.method === "text" && !draft.rawText.trim()) {
          router.replace("/analyze");
          return;
        }

        // 동일 분석이 서버에서 진행 중일 때 충분히 기다릴 수 있도록
        // 기존 약 5.6초(8회)에서 최대 약 30초 범위로 확장합니다.
        for (let attempt = 0; attempt < 30; attempt += 1) {
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              images,
              rawText: draft.method === "text" ? draft.rawText : undefined,
              meSpeaker: draft.meSpeaker,
              context,
              locale: analysisLocale,
            }),
            signal: controller.signal,
          });

          const data = await response.json().catch(() => ({})) as ApiPayload;

          if (response.status === 202 && data.status === "processing") {
            const headerSeconds = Number(response.headers.get("Retry-After") || 0);
            const retrySeconds = Number(data.retryAfter || 0);
            const delay = Math.max(500, Math.min(1500, (headerSeconds || retrySeconds || 1) * 1000));
            await wait(delay, controller.signal);
            continue;
          }

          if (!response.ok || !data.result) {
            if (data.suggestedMode) setSuggestedMode(data.suggestedMode);
            setErrorCode(data.code || String(response.status));
            throw new Error(data.error || t("analysisFailed"));
          }

          if (disposed || controller.signal.aborted) return;

          // 응답 직전에는 모든 단계가 완료된 상태를 짧게 보여줍니다.
          setIdx(4);
          resultStorage.write(data.result);
          uploadStorage.clear();
          await wait(260, controller.signal);
          router.replace("/report");
          return;
        }

        setErrorCode("processing_timeout");
        throw new Error(t("processingLong"));
      } catch (caught) {
        if (disposed || controller.signal.aborted || (caught instanceof DOMException && caught.name === "AbortError")) return;
        setError(caught instanceof Error ? caught.message : t("analysisFailed"));
      }
    };

    run();

    return () => {
      disposed = true;
      controller.abort();

      // 개발 환경의 React Strict Mode는 effect를 mount→cleanup→mount로 검증합니다.
      // cleanup에서 guard를 되돌리지 않으면 두 번째 정상 실행이 막혀 1단계에 영구 정지합니다.
      requestStartedRef.current = false;
    };
  }, [ready, router]);

  const cancel = () => {
    if (cancelling) return;
    setCancelling(true);
    controllerRef.current?.abort();
    resultStorage.clear();
    const draft = inputDraftStorage.read();
    router.replace(draft?.method === "image" ? "/analyze/upload" : "/analyze/details");
  };

  if (error) {
    const missingApiKey = process.env.NODE_ENV === "development" && error.includes("OPENAI_API_KEY");
    const isBusy = errorCode === "client_limit" || errorCode === "429" || errorCode === "processing_timeout";

    return <div className="analysis-error">
      <div className="analysis-error-icon">{missingApiKey ? "🔑" : isBusy ? "🐰" : "😵"}</div>
      <h2>{missingApiKey ? t("apiKeyNeeded") : isBusy ? t("busyTitle") : t("analysisFailedTitle")}</h2>
      <p>{missingApiKey ? t("apiKeyHelp") : error}</p>
      <AppButton fullWidth onClick={() => {
        if (suggestedMode) {
          contextStorage.update({ mode: suggestedMode });
          router.replace("/analyze/context");
          return;
        }
        router.replace(inputDraftStorage.read()?.method === "image" ? "/analyze/upload" : "/analyze/details");
      }}>
        {suggestedMode
          ? (suggestedMode === "group" ? t("switchGroup") : t("switchDirect"))
          : t("backToSettings")}
      </AppButton>
    </div>;
  }

  const texts = mode === "group"
    ? [t("pGroup1"), t("pGroup2"), t("pGroup3"), t("pGroup4")]
    : [t("pDirect1"), t("pDirect2"), t("pDirect3"), t("pDirect4")];

  const liveCopy = elapsed >= 15
    ? (locale === "ko" ? "캡처가 많아 조금 더 꼼꼼히 보고 있어요." : t("processingLong"))
    : elapsed >= 8
      ? (locale === "ko" ? "거의 다 읽었어요. 핵심 흐름을 고르는 중이에요." : texts[Math.min(idx, 3)])
      : texts[Math.min(idx, 3)];

  return <>
    <ProcessingMascot stage={Math.min(idx, 3)} />
    <div className="processing-live-copy" aria-live="polite">{liveCopy}</div>

    <div className="steps">
      {texts.map((text, index) => {
        const complete = index < idx;
        const active = index === Math.min(idx, 3) && idx < 4;

        return <div className={`step ${complete ? "done" : active ? "active" : ""}`} key={text}>
          <div className="step-dot">
            {complete
              ? <span className="step-check" aria-label={t("complete")}>✓</span>
              : index + 1}
          </div>
          <BrandFeature variant={stepIcons[index]} size={36} />
          <strong>{text}</strong>
        </div>;
      })}
    </div>

    <div className="processing-actions">
      <AppButton
        variant="secondary"
        fullWidth
        className="cancel-analysis"
        onClick={cancel}
        disabled={cancelling}
      >
        {cancelling ? t("cancelling") : t("backToSettings")}
      </AppButton>
      <p>{t("cancelHelp")}</p>
    </div>
  </>;
}
