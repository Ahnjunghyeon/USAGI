"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ProcessingMascot from "@/components/ProcessingMascot";
import { AppButton } from "@/components/ui/Button";
import { contextStorage, inputDraftStorage, resultStorage } from "@/lib/client/storage";
import { imageDraftStore } from "@/lib/client/image-draft-store";
import { useLocale } from "@/components/LocaleProvider";

// Result is validated again by resultStorage before it is persisted.
type ApiPayload = {
  result?: unknown;
  error?: string;
  suggestedMode?: "direct" | "group";
  status?: "processing" | "complete" | "expired" | "invalid";
  code?: string;
  retryAfter?: number;
  jobId?: string;
};

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    const abort = () => {
      window.clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
  });
}

async function readPayload(response: Response): Promise<ApiPayload> {
  return response.json().catch(() => ({})) as Promise<ApiPayload>;
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

  useEffect(() => {
    if (!ready) return;
    const draft = inputDraftStorage.read();
    const isImage = draft?.method === "image";
    const schedule = isImage ? [1800, 4300, 7600] : [900, 2200, 3900];
    setIdx(0);
    setElapsed(0);

    const stageTimers = schedule.map((delay, index) => window.setTimeout(() => setIdx(index + 1), delay));
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

    const pollJob = async (jobId: string) => {
      for (let attempt = 0; attempt < 45; attempt += 1) {
        const response = await fetch(`/api/analyze/status?jobId=${encodeURIComponent(jobId)}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await readPayload(response);
        if (response.ok && data.status === "complete" && data.result) return data.result;
        if (response.status === 202 && data.status === "processing") {
          const seconds = Math.max(1, Number(data.retryAfter || response.headers.get("Retry-After") || 1));
          await wait(Math.min(1500, seconds * 1000), controller.signal);
          continue;
        }
        if (response.status === 404 || data.status === "expired") throw new Error(t("processingLong"));
        throw new Error(data.error || t("analysisFailed"));
      }
      throw new Error(t("processingLong"));
    };

    const run = async () => {
      try {
        const context = contextStorage.read();
        const draft = inputDraftStorage.read();
        if (context?.mode === "group") setMode("group");
        if (!context) { router.replace("/analyze/context"); return; }
        if (!draft) { router.replace("/analyze"); return; }

        const images = draft.method === "image" ? await imageDraftStore.read() : [];
        if (draft.method === "image" && !images.length) { router.replace("/analyze/upload"); return; }
        if (draft.method === "text" && !draft.rawText.trim()) { router.replace("/analyze"); return; }

        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Usagi-Locale": locale },
          body: JSON.stringify({
            images,
            rawText: draft.method === "text" ? draft.rawText : undefined,
            meSpeaker: draft.meSpeaker,
            meBubbleSide: draft.meBubbleSide,
            context,
            locale,
          }),
          signal: controller.signal,
        });
        const data = await readPayload(response);

        let result: unknown;
        if (response.status === 202 && data.status === "processing" && data.jobId) {
          // Poll by job id only. Large image payloads are never re-sent.
          result = await pollJob(data.jobId);
        } else if (response.ok && data.result) {
          result = data.result;
        } else {
          if (data.suggestedMode) setSuggestedMode(data.suggestedMode);
          setErrorCode(data.code || String(response.status));
          throw new Error(data.error || t("analysisFailed"));
        }

        if (disposed || controller.signal.aborted) return;
        setIdx(4);
        const stored = resultStorage.write(result);
        if (!stored.ok) throw new Error(t("uploadStorageFailed"));
        await imageDraftStore.clear();
        await wait(260, controller.signal);
        router.replace("/report");
      } catch (caught) {
        if (disposed || controller.signal.aborted || (caught instanceof DOMException && caught.name === "AbortError")) return;
        setError(caught instanceof Error ? caught.message : t("analysisFailed"));
      }
    };

    // In development, React Strict Mode mounts and immediately cleans up once.
    // Delaying the network request prevents that probe from sending a duplicate AI request.
    const startTimer = window.setTimeout(() => void run(), 0);
    return () => {
      disposed = true;
      window.clearTimeout(startTimer);
      controller.abort();
      requestStartedRef.current = false;
    };
  }, [locale, ready, router, t]);

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
    return <div className="analysis-error" role="alert">
      <div className="analysis-error-icon" aria-hidden="true">{missingApiKey ? "🔑" : isBusy ? "🐰" : "😵"}</div>
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
          ? suggestedMode === "group" ? t("switchGroup") : t("switchDirect")
          : t("backToSettings")}
      </AppButton>
    </div>;
  }

  const texts = mode === "group"
    ? [t("pGroup1"), t("pGroup2"), t("pGroup3"), t("pGroup4")]
    : [t("pDirect1"), t("pDirect2"), t("pDirect3"), t("pDirect4")];
  const liveCopy = elapsed >= 15
    ? t("processingLongImage")
    : elapsed >= 8
      ? t("processingAlmostDone")
      : texts[Math.min(idx, 3)];

  return <>
    <ProcessingMascot stage={Math.min(idx, 3)} />
    <div className="processing-live-copy" role="status" aria-live="polite">{liveCopy}</div>

    <div className="steps uds-analysis-steps" role="list" aria-label={t("processingEyebrow")}>
      {texts.map((text, index) => {
        const complete = index < idx;
        const active = index === Math.min(idx, 3) && idx < 4;
        return <div className={`step ${complete ? "done" : active ? "active" : ""}`} role="listitem" key={text}>
          <div className="step-dot" aria-hidden="true">{complete ? <span className="step-check">✓</span> : active ? <span className="uds-pulse-dot" /> : index + 1}</div>
          <div className="uds-step-copy"><strong>{text}</strong><small>{complete ? t("complete") : active ? liveCopy : ""}</small></div>
        </div>;
      })}
    </div>

    <div className="processing-actions">
      <AppButton variant="secondary" fullWidth className="cancel-analysis" onClick={cancel} disabled={cancelling}>
        {cancelling ? t("cancelling") : t("cancelAndBack")}
      </AppButton>
      <p>{t("cancelHelp")}</p>
    </div>
  </>;
}
