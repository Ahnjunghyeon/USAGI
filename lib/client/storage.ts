"use client";

import type { UrIsaiContext } from "@/lib/context";
import type { AnalysisResult, GroupAnalysis } from "@/lib/analysis";

export type StoredAnalysisResult = AnalysisResult & { groupAnalysis?: GroupAnalysis };
export type BubbleSide = "right" | "left" | "auto";

export const STORAGE_VERSION = 2;
export const STORAGE_KEYS = {
  context: "urisai-context",
  analysisResult: "usagi-analysis-result",
  inputDraft: "usagi-input-draft",
} as const;

type Envelope<T> = { version: number; savedAt: string; value: T };
export type StorageWriteResult = { ok: true } | { ok: false; reason: "quota" | "unavailable" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrap<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isRecord(parsed) && parsed.version === STORAGE_VERSION && "value" in parsed) return parsed.value as T;
    // v0.4.x migration: accept the previous raw JSON shape once.
    return parsed as T;
  } catch {
    return null;
  }
}

function readJson<T>(storage: Storage, key: string): T | null {
  try {
    return unwrap<T>(storage.getItem(key));
  } catch {
    return null;
  }
}

function writeJson(storage: Storage, key: string, value: unknown): StorageWriteResult {
  try {
    const envelope: Envelope<unknown> = { version: STORAGE_VERSION, savedAt: new Date().toISOString(), value };
    storage.setItem(key, JSON.stringify(envelope));
    return { ok: true };
  } catch (error) {
    const quota = error instanceof DOMException && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");
    return { ok: false, reason: quota ? "quota" : "unavailable" };
  }
}

export function isContext(value: unknown): value is UrIsaiContext {
  if (!isRecord(value) || (value.mode !== "direct" && value.mode !== "group")) return false;
  return typeof value.relationship === "string"
    && typeof value.duration === "string"
    && typeof value.goal === "string"
    && isRecord(value.me)
    && isRecord(value.other)
    && isRecord(value.aiFriend)
    && typeof value.aiFriend.name === "string";
}

function isMetrics(value: unknown): boolean {
  if (!isRecord(value) || typeof value.totalMessages !== "number") return false;
  return isRecord(value.messageCount)
    && typeof value.messageCount.me === "number"
    && typeof value.messageCount.other === "number"
    && isRecord(value.messageBalance)
    && typeof value.messageBalance.me === "number"
    && typeof value.messageBalance.other === "number";
}


function isAnalysisSource(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (value.inputType === "text" || value.inputType === "image")
    && ["kakao", "generic", "vision"].includes(String(value.parser))
    && ["high", "medium", "low"].includes(String(value.confidence))
    && Array.isArray(value.participantNames)
    && value.participantNames.every((item) => typeof item === "string")
    && Array.isArray(value.warnings)
    && value.warnings.every((item) => typeof item === "string");
}

function isGroupAnalysis(value: unknown): boolean {
  if (!isRecord(value) || typeof value.participantCount !== "number") return false;
  if (!Array.isArray(value.participants) || !Array.isArray(value.participantNotes)) return false;
  return value.participantNotes.every((item) => isRecord(item) && typeof item.name === "string" && typeof item.note === "string");
}

export function isStoredAnalysisResult(value: unknown): value is StoredAnalysisResult {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || typeof value.createdAt !== "string") return false;
  if (!isContext(value.context) || !isMetrics(value.metrics)) return false;
  if (typeof value.summary !== "string" || typeof value.friendComment !== "string") return false;
  if (!Array.isArray(value.highlights) || !value.highlights.every((item) => typeof item === "string")) return false;
  if (!["적음", "보통", "충분"].includes(String(value.dataAmount))) return false;
  if ("source" in value && value.source !== undefined && !isAnalysisSource(value.source)) return false;
  if ("groupAnalysis" in value && value.groupAnalysis !== undefined && !isGroupAnalysis(value.groupAnalysis)) return false;
  return typeof value.extractedMessageCount === "number" && value.extractedMessageCount >= 0;
}

export const contextStorage = {
  read: (): UrIsaiContext | null => {
    if (typeof window === "undefined") return null;
    const current = readJson<unknown>(window.sessionStorage, STORAGE_KEYS.context);
    if (isContext(current)) return current;

    // Move the old persistent value into session storage and remove it.
    const legacy = readJson<unknown>(window.localStorage, STORAGE_KEYS.context);
    if (isContext(legacy)) {
      writeJson(window.sessionStorage, STORAGE_KEYS.context, legacy);
      window.localStorage.removeItem(STORAGE_KEYS.context);
      return legacy;
    }
    return null;
  },
  write: (context: UrIsaiContext) => {
    if (typeof window === "undefined") return { ok: false, reason: "unavailable" } as StorageWriteResult;
    const result = writeJson(window.sessionStorage, STORAGE_KEYS.context, context);
    window.localStorage.removeItem(STORAGE_KEYS.context);
    return result;
  },
  clear: () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(STORAGE_KEYS.context);
    window.localStorage.removeItem(STORAGE_KEYS.context);
  },
  update: (patch: Partial<UrIsaiContext>) => {
    if (typeof window === "undefined") return null;
    const current = contextStorage.read();
    if (!current) return null;
    const next = { ...current, ...patch };
    return contextStorage.write(next).ok ? next : null;
  },
};

export const resultStorage = {
  read: (): StoredAnalysisResult | null => {
    if (typeof window === "undefined") return null;
    const value = readJson<unknown>(window.sessionStorage, STORAGE_KEYS.analysisResult);
    if (isStoredAnalysisResult(value)) return value;
    window.sessionStorage.removeItem(STORAGE_KEYS.analysisResult);
    return null;
  },
  write: (result: unknown) => {
    if (typeof window === "undefined" || !isStoredAnalysisResult(result)) return { ok: false, reason: "unavailable" } as StorageWriteResult;
    return writeJson(window.sessionStorage, STORAGE_KEYS.analysisResult, result);
  },
  clear: () => {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(STORAGE_KEYS.analysisResult);
  },
};

export type UsagiInputDraft = {
  method: "text" | "image";
  rawText: string;
  participants: string[];
  detectedMode: "direct" | "group" | "unknown";
  meSpeaker?: string;
  meBubbleSide?: BubbleSide;
  parser?: "kakao" | "generic";
  parserConfidence?: "high" | "medium";
  parserWarnings?: string[];
};

export function isInputDraft(value: unknown): value is UsagiInputDraft {
  if (!isRecord(value) || (value.method !== "text" && value.method !== "image")) return false;
  return typeof value.rawText === "string"
    && Array.isArray(value.participants)
    && value.participants.every((item) => typeof item === "string")
    && ["direct", "group", "unknown"].includes(String(value.detectedMode));
}

export const inputDraftStorage = {
  read(): UsagiInputDraft | null {
    if (typeof window === "undefined") return null;
    const value = readJson<unknown>(window.sessionStorage, STORAGE_KEYS.inputDraft);
    if (isInputDraft(value)) return value;
    window.sessionStorage.removeItem(STORAGE_KEYS.inputDraft);
    return null;
  },
  write(value: UsagiInputDraft) {
    if (typeof window === "undefined") return { ok: false, reason: "unavailable" } as StorageWriteResult;
    return writeJson(window.sessionStorage, STORAGE_KEYS.inputDraft, value);
  },
  clear() {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(STORAGE_KEYS.inputDraft);
  },
};
