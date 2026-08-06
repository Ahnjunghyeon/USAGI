"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BrandFeature from "@/components/BrandFeature";
import { AppButton } from "@/components/ui/Button";
import { contextStorage, inputDraftStorage, resultStorage, type BubbleSide } from "@/lib/client/storage";
import { imageDraftStore } from "@/lib/client/image-draft-store";
import {
  ImagePreparationError,
  mergeImageFiles,
  prepareUploadImages,
} from "@/lib/client/image-upload";
import { MAX_UPLOAD_IMAGES } from "@/lib/upload-config";
import { useLocale } from "@/components/LocaleProvider";

export default function Upload() {
  const router = useRouter();
  const { t } = useLocale();
  const inputId = useId();
  const [files, setFiles] = useState<File[]>([]);
  const [storedImageCount, setStoredImageCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [mode, setMode] = useState<"direct" | "group">("direct");
  const [uploadConfirmed, setUploadConfirmed] = useState(false);
  const [bubbleSide, setBubbleSide] = useState<BubbleSide>("right");
  const pendingClearRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    resultStorage.clear();
    const context = contextStorage.read();
    const draft = inputDraftStorage.read();
    if (!context || !draft || draft.method !== "image") {
      router.replace("/analyze");
      return;
    }
    setMode(context.mode === "group" ? "group" : "direct");
    if (draft.meBubbleSide) setBubbleSide(draft.meBubbleSide);
    void imageDraftStore.read().then((images) => setStoredImageCount(images.length));
  }, [router]);

  const applyFiles = (list: FileList | File[]) => {
    const merged = mergeImageFiles(files, list);
    setFiles(merged.files);
    setStoredImageCount(0);
    pendingClearRef.current = imageDraftStore.clear();

    if (merged.rejected > 0) setError(t("uploadUnsupportedType"));
    else if (merged.truncated) setError(t("uploadTooMany", { n: MAX_UPLOAD_IMAGES }));
    else setError("");
  };

  const move = (index: number, direction: -1 | 1) => {
    setFiles((previous) => {
      const target = index + direction;
      if (target < 0 || target >= previous.length) return previous;
      const next = [...previous];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const errorMessage = (caught: unknown) => {
    if (caught instanceof ImagePreparationError) {
      if (caught.code === "unsupported_type") return t("uploadUnsupportedType");
      if (caught.code === "too_many") return t("uploadTooMany", { n: MAX_UPLOAD_IMAGES });
      if (caught.code === "too_large") return t("uploadTooLarge");
      return t("uploadImageError");
    }
    if (caught instanceof DOMException && caught.name === "QuotaExceededError") return t("uploadStorageFailed");
    return t("uploadImageError");
  };

  const start = async () => {
    if ((!files.length && !storedImageCount) || preparing || !uploadConfirmed) return;
    setPreparing(true);
    setError("");

    try {
      await pendingClearRef.current;
      if (files.length) {
        const images = await prepareUploadImages(files);
        await imageDraftStore.write(images);
        setStoredImageCount(images.length);
      }

      const draft = inputDraftStorage.read();
      if (!draft) {
        router.replace("/analyze");
        return;
      }
      const stored = inputDraftStorage.write({ ...draft, meBubbleSide: bubbleSide });
      if (!stored.ok) throw new Error("draft_storage_failed");
      router.push("/analyze/processing");
    } catch (caught) {
      setError(caught instanceof Error && caught.message === "draft_storage_failed" ? t("uploadStorageFailed") : errorMessage(caught));
      setPreparing(false);
    }
  };

  const availableCount = files.length || storedImageCount;

  return <>
    <label
      className={`upload-box ${isDragging ? "dragging" : ""}`}
      htmlFor={inputId}
      onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
      onDragLeave={(event) => { event.preventDefault(); if (event.currentTarget === event.target) setIsDragging(false); }}
      onDrop={(event) => { event.preventDefault(); setIsDragging(false); applyFiles(event.dataTransfer.files); }}
    >
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(event) => {
          if (event.target.files) applyFiles(event.target.files);
          event.currentTarget.value = "";
        }}
      />
      <div className="upload-icon"><BrandFeature variant="stealth" size={56} /></div>
      <strong className="upload-title">{isDragging ? t("uploadDrop") : mode === "group" ? t("uploadGroup") : t("uploadDirect")}</strong>
      <div className="upload-help">
        <span>{mode === "group" ? t("uploadGroupHelp") : t("uploadDirectHelp")}</span>
        <span>{t("uploadClick", { n: MAX_UPLOAD_IMAGES })}</span>
      </div>
      {availableCount > 0 && <span className="chip upload-selected">{t("selected", { n: availableCount })}</span>}
    </label>

    {files.length > 0 && <div className="file-list" aria-label={t("selected", { n: files.length })}>
      <div className="action-help file-sort-help">{mode === "group" ? t("sortGroup") : t("sortDirect")}</div>
      {files.map((file, index) => <div className="file-item" key={`${file.name}-${file.lastModified}-${index}`}>
        <span aria-hidden="true">{index + 1}</span>
        <strong>{file.name}</strong>
        <div className="file-actions">
          <AppButton
            variant="ghost"
            size="sm"
            disabled={index === 0}
            aria-label={`${file.name}: ${t("moveUp")}`}
            onClick={(event) => { event.preventDefault(); move(index, -1); }}
          >↑</AppButton>
          <AppButton
            variant="ghost"
            size="sm"
            disabled={index === files.length - 1}
            aria-label={`${file.name}: ${t("moveDown")}`}
            onClick={(event) => { event.preventDefault(); move(index, 1); }}
          >↓</AppButton>
          <AppButton
            variant="ghost"
            size="sm"
            aria-label={`${file.name}: ${t("deleteImage")}`}
            onClick={(event) => {
              event.preventDefault();
              setFiles((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
            }}
          >{t("delete")}</AppButton>
        </div>
      </div>)}
    </div>}

    <fieldset className="form-card stack bubble-side-card">
      <legend>{t("bubbleSideTitle")}</legend>
      <p className="form-help">{t("bubbleSideHelp")}</p>
      <div className="bubble-side-options">
        {(["right", "left", "auto"] as const).map((side) => {
          const label = side === "right" ? t("bubbleSideRight") : side === "left" ? t("bubbleSideLeft") : t("bubbleSideAuto");
          return <label className={`bubble-side-option ${bubbleSide === side ? "selected" : ""}`} key={side}>
            <input type="radio" name="bubble-side" value={side} checked={bubbleSide === side} onChange={() => setBubbleSide(side)} />
            <span aria-hidden="true">{side === "right" ? "→" : side === "left" ? "←" : "↔"}</span>
            <strong>{label}</strong>
          </label>;
        })}
      </div>
      {bubbleSide === "auto" && <small className="action-help">{t("bubbleSideAutoHelp")}</small>}
    </fieldset>

    {error && <div className="upload-error" role="alert">{error}</div>}

    <div className="form-card upload-policy-card">
      <strong>{t("privacyTitle")}</strong>
      <p className="upload-privacy-copy">{t("privacyUpload")}</p>
      <label className="policy-check inline">
        <input type="checkbox" checked={uploadConfirmed} onChange={(event) => setUploadConfirmed(event.target.checked)} />
        <span>{t("uploadConsent")}</span>
      </label>
    </div>

    <div className="bottom-actions">
      <AppButton fullWidth disabled={!availableCount || preparing || !uploadConfirmed} onClick={start}>
        {preparing ? t("preparePhoto") : t("startAnalysis")}
      </AppButton>
      {!availableCount
        ? <div className="action-help">{t("needImage")}</div>
        : !uploadConfirmed && <div className="action-help">{t("needUploadConsent")}</div>}
    </div>
  </>;
}
