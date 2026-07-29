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

export const setupDraftStorage = {
  read(): UsagiSetupDraft | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? JSON.parse(raw) as UsagiSetupDraft : null;
    } catch { return null; }
  },
  write(value: UsagiSetupDraft) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(KEY, JSON.stringify(value));
  },
  clear() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(KEY);
  },
};
