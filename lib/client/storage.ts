import type { UrIsaiContext } from "@/lib/context";
import type { AnalysisResult, GroupAnalysis } from "@/lib/analysis";

export type StoredAnalysisResult = AnalysisResult & { groupAnalysis?: GroupAnalysis };

export const STORAGE_KEYS = {
  context: "urisai-context",
  uploadImages: "usagi-upload-images",
  analysisResult: "usagi-analysis-result",
} as const;

function readJson<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
}

function writeJson(storage: Storage, key: string, value: unknown) {
  storage.setItem(key, JSON.stringify(value));
}

export const contextStorage = {
  read: () => {
    if (typeof window === "undefined") return null;
    const current = readJson<UrIsaiContext>(window.sessionStorage, STORAGE_KEYS.context);
    if (current) return current;
    const legacy = readJson<UrIsaiContext>(window.localStorage, STORAGE_KEYS.context);
    if (legacy) {
      writeJson(window.sessionStorage, STORAGE_KEYS.context, legacy);
      window.localStorage.removeItem(STORAGE_KEYS.context);
    }
    return legacy;
  },
  write: (context: UrIsaiContext) => {
    if (typeof window === "undefined") return;
    writeJson(window.sessionStorage, STORAGE_KEYS.context, context);
    window.localStorage.removeItem(STORAGE_KEYS.context);
  },
  clear: () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(STORAGE_KEYS.context);
    window.localStorage.removeItem(STORAGE_KEYS.context);
  },
  update: (patch: Partial<UrIsaiContext>) => {
    if (typeof window === "undefined") return null;
    const current = readJson<UrIsaiContext>(window.sessionStorage, STORAGE_KEYS.context);
    if (!current) return null;
    const next = { ...current, ...patch };
    writeJson(window.sessionStorage, STORAGE_KEYS.context, next);
    return next;
  },
};

export const uploadStorage = {
  read: () => typeof window === "undefined" ? null : readJson<string[]>(window.sessionStorage, STORAGE_KEYS.uploadImages),
  write: (images: string[]) => { if (typeof window !== "undefined") writeJson(window.sessionStorage, STORAGE_KEYS.uploadImages, images); },
  clear: () => { if (typeof window !== "undefined") window.sessionStorage.removeItem(STORAGE_KEYS.uploadImages); },
};

export const resultStorage = {
  read: () => typeof window === "undefined" ? null : readJson<StoredAnalysisResult>(window.sessionStorage, STORAGE_KEYS.analysisResult),
  write: (result: unknown) => { if (typeof window !== "undefined") writeJson(window.sessionStorage, STORAGE_KEYS.analysisResult, result); },
  clear: () => { if (typeof window !== "undefined") window.sessionStorage.removeItem(STORAGE_KEYS.analysisResult); },
};


export type UsagiInputDraft = {
  method: "text" | "image";
  rawText: string;
  participants: string[];
  detectedMode: "direct" | "group" | "unknown";
  meSpeaker?: string;
};

const INPUT_DRAFT_KEY = "usagi-input-draft";

export const inputDraftStorage = {
  read(): UsagiInputDraft | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(INPUT_DRAFT_KEY);
      return raw ? JSON.parse(raw) as UsagiInputDraft : null;
    } catch { return null; }
  },
  write(value: UsagiInputDraft) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(INPUT_DRAFT_KEY, JSON.stringify(value));
  },
  clear() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(INPUT_DRAFT_KEY);
  },
};
