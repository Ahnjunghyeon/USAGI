"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { parseChatText } from "@/lib/chat-text";
import { inputDraftStorage } from "@/lib/client/storage";
import { AppButton } from "@/components/ui/Button";
import { useLocale } from "@/components/LocaleProvider";

export default function ConversationInput() {
  const router = useRouter();
  const { t } = useLocale();
  const textareaId = useId();
  const textPanelId = useId();
  const imagePanelId = useId();
  const [method, setMethod] = useState<"text" | "image">("text");
  const [rawText, setRawText] = useState("");
  const [storageError, setStorageError] = useState("");
  const parsed = useMemo(() => rawText.trim() ? parseChatText(rawText) : null, [rawText]);

  const selectFromKeyboard = (event: KeyboardEvent<HTMLButtonElement>, current: "text" | "image") => {
    const order = ["text", "image"] as const;
    const currentIndex = order.indexOf(current);
    let next: "text" | "image" | null = null;
    if (event.key === "ArrowRight") next = order[(currentIndex + 1) % order.length];
    if (event.key === "ArrowLeft") next = order[(currentIndex - 1 + order.length) % order.length];
    if (event.key === "Home") next = order[0];
    if (event.key === "End") next = order.at(-1)!;
    if (!next) return;
    event.preventDefault();
    setMethod(next);
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`[data-method="${next}"]`)?.focus();
  };

  const proceedText = () => {
    if (!parsed) return;
    const result = inputDraftStorage.write({
      method: "text",
      rawText,
      participants: parsed.participants,
      detectedMode: parsed.detectedMode,
      parser: parsed.parser,
      parserConfidence: parsed.confidence,
      parserWarnings: parsed.warnings,
    });
    if (result.ok) { setStorageError(""); router.push("/analyze/context"); }
    else setStorageError(t("draftStorageFailed"));
  };

  const proceedImage = () => {
    const result = inputDraftStorage.write({
      method: "image",
      rawText: "",
      participants: [],
      detectedMode: "unknown",
      meBubbleSide: "right",
    });
    if (result.ok) { setStorageError(""); router.push("/analyze/context"); }
    else setStorageError(t("draftStorageFailed"));
  };

  return <div className="conversation-input">
    {storageError && <div className="upload-error" role="alert">{storageError}</div>}
    <div className="inline-ai-notice"><strong>AI</strong><span>{t("inlineAiNotice")}</span></div>
    <div className="guide-bunny" aria-hidden="true"><img src="/ui/usagi-focus.webp" alt="" width={88} height={88} /></div>
    <div className="guide-copy"><strong>{t("guideInput")}</strong><span>{t("guideInputSub")}</span></div>

    <div className="input-method-tabs" role="tablist" aria-label={t("inputAria")}>
      <button
        id="text-input-tab"
        data-method="text"
        type="button"
        role="tab"
        aria-selected={method === "text"}
        aria-controls={textPanelId}
        tabIndex={method === "text" ? 0 : -1}
        className={method === "text" ? "selected" : ""}
        onClick={() => setMethod("text")}
        onKeyDown={(event) => selectFromKeyboard(event, "text")}
      >{t("textTab")}</button>
      <button
        id="image-input-tab"
        data-method="image"
        type="button"
        role="tab"
        aria-selected={method === "image"}
        aria-controls={imagePanelId}
        tabIndex={method === "image" ? 0 : -1}
        className={method === "image" ? "selected" : ""}
        onClick={() => setMethod("image")}
        onKeyDown={(event) => selectFromKeyboard(event, "image")}
      >{t("imageTab")}</button>
    </div>

    {method === "text" ? <div id={textPanelId} role="tabpanel" aria-labelledby="text-input-tab">
      <label className="sr-only" htmlFor={textareaId}>{t("textareaLabel")}</label>
      <textarea
        id={textareaId}
        className="conversation-textarea"
        value={rawText}
        onChange={(event) => setRawText(event.target.value)}
        placeholder={`${t("chatExample1")}\n${t("chatExample2")}`}
        spellCheck={false}
        aria-describedby="conversation-parse-feedback"
      />
      <div id="conversation-parse-feedback" className={`parse-feedback ${parsed ? "ok" : ""}`} role="status" aria-live="polite">
        {rawText.trim() && parsed
          ? <>✓ <strong>{parsed.participants.length}</strong> · {parsed.messages.length} · {t(parsed.confidence === "high" ? "parserConfidenceHigh" : "parserConfidenceMedium")}</>
          : rawText.trim() ? t("parseFail") : t("parseHint")}
      </div>
      <AppButton onClick={proceedText} disabled={!parsed}>{t("analyzeChat")}</AppButton>
    </div> : <div id={imagePanelId} role="tabpanel" aria-labelledby="image-input-tab">
      <div className="image-method-callout"><strong>{t("imageMethodTitle")}</strong><span>{t("imageMethodDesc")}</span></div>
      <AppButton onClick={proceedImage}>{t("imageContinue")}</AppButton>
    </div>}
  </div>;
}
