"use client";

import type { ConversationMode, RelationshipType } from "@/lib/context";

export type UsagiSetupDraft = {
  mode: ConversationMode;
  relationship: RelationshipType;
  duration: string;
  goal: string;
  groupGoal?: string;
};

const KEY = "usagi-setup-draft";
const VERSION = 2;

type Envelope = { version: number; savedAt: string; value: UsagiSetupDraft };

function isDraft(value: unknown): value is UsagiSetupDraft {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const draft = value as Record<string, unknown>;
  return (draft.mode === "direct" || draft.mode === "group")
    && typeof draft.relationship === "string"
    && typeof draft.duration === "string"
    && typeof draft.goal === "string";
}

export const setupDraftStorage = {
  read(): UsagiSetupDraft | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as unknown;
      if (typeof parsed === "object" && parsed !== null && "value" in parsed) {
        const value = (parsed as Envelope).value;
        return isDraft(value) ? value : null;
      }
      return isDraft(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },
  write(value: UsagiSetupDraft) {
    if (typeof window === "undefined") return false;
    try {
      const envelope: Envelope = { version: VERSION, savedAt: new Date().toISOString(), value };
      sessionStorage.setItem(KEY, JSON.stringify(envelope));
      return true;
    } catch {
      return false;
    }
  },
  clear() {
    if (typeof window !== "undefined") sessionStorage.removeItem(KEY);
  },
};
