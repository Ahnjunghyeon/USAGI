"use client";

export type FeedbackRating = "accurate" | "partial" | "different";
export type FeedbackIssue = "speaker" | "flow" | "tone" | "people" | "other";

export type AnalysisFeedback = {
  analysisId: string;
  createdAt: string;
  rating: FeedbackRating;
  issues: FeedbackIssue[];
  note?: string;
  inputType?: "text" | "image";
  mode: "direct" | "group";
  confidence?: "high" | "medium" | "low";
};

const KEY = "usagi-analysis-feedback-v1";
const MAX_ITEMS = 30;

export function isAnalysisFeedback(value: unknown): value is AnalysisFeedback {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.analysisId === "string"
    && typeof item.createdAt === "string"
    && ["accurate", "partial", "different"].includes(String(item.rating))
    && (item.mode === "direct" || item.mode === "group")
    && Array.isArray(item.issues)
    && item.issues.every((issue) => ["speaker", "flow", "tone", "people", "other"].includes(String(issue)))
    && (item.note === undefined || typeof item.note === "string");
}

function readAll(): AnalysisFeedback[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as unknown;
    return Array.isArray(parsed) ? parsed.filter(isAnalysisFeedback) : [];
  } catch {
    return [];
  }
}

export const feedbackStorage = {
  read(analysisId: string): AnalysisFeedback | null {
    return readAll().find((item) => item.analysisId === analysisId) ?? null;
  },
  write(feedback: AnalysisFeedback): boolean {
    if (typeof window === "undefined" || !isAnalysisFeedback(feedback)) return false;
    try {
      const next = [feedback, ...readAll().filter((item) => item.analysisId !== feedback.analysisId)].slice(0, MAX_ITEMS);
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return true;
    } catch {
      return false;
    }
  },
  clear(): void {
    if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
  },
};
