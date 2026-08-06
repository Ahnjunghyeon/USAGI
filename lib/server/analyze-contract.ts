import {
  MAX_SINGLE_IMAGE_CHARS,
  MAX_TOTAL_IMAGE_CHARS,
  MAX_UPLOAD_IMAGES,
} from "@/lib/upload-config";

const IMAGE_PATTERN = /^data:image\/(jpeg|jpg|png|webp);base64,/i;

export type MeBubbleSide = "right" | "left" | "auto";
export type VisionSide = "right" | "left" | "unclear";
export type VisionConfidence = "high" | "medium" | "low";

export type ParsedMessage = {
  speakerId: string;
  speakerName: string;
  isMe: boolean;
  text: string;
  timestamp?: string | null;
};

export type ParsedConversation = {
  conversationType: "direct" | "group" | "unclear";
  meSide: VisionSide;
  confidence: VisionConfidence;
  warnings: string[];
  messages: ParsedMessage[];
};

export type Narrative = {
  summary: string;
  highlights: string[];
  friendComment: string;
};

export type GroupNarrative = Narrative & {
  standoutName: string | null;
  standoutReason: string;
  participantNotes: { name: string; note: string }[];
};

export const parsedConversationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["conversationType", "meSide", "confidence", "warnings", "messages"],
  properties: {
    conversationType: { type: "string", enum: ["direct", "group", "unclear"] },
    meSide: { type: "string", enum: ["right", "left", "unclear"] },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    warnings: { type: "array", maxItems: 8, items: { type: "string" } },
    messages: {
      type: "array",
      maxItems: 1000,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["speakerId", "speakerName", "isMe", "text", "timestamp"],
        properties: {
          speakerId: { type: "string" },
          speakerName: { type: "string" },
          isMe: { type: "boolean" },
          text: { type: "string" },
          timestamp: { type: ["string", "null"] },
        },
      },
    },
  },
};

export const narrativeSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "highlights", "friendComment"],
  properties: {
    summary: { type: "string" },
    highlights: { type: "array", minItems: 2, maxItems: 3, items: { type: "string" } },
    friendComment: { type: "string" },
  },
};

export const groupNarrativeSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "highlights", "friendComment", "standoutName", "standoutReason", "participantNotes"],
  properties: {
    summary: { type: "string" },
    highlights: { type: "array", minItems: 2, maxItems: 3, items: { type: "string" } },
    friendComment: { type: "string" },
    standoutName: { type: ["string", "null"] },
    standoutReason: { type: "string" },
    participantNotes: {
      type: "array",
      minItems: 0,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "note"],
        properties: {
          name: { type: "string" },
          note: { type: "string" },
        },
      },
    },
  },
};

export function validateImages(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_UPLOAD_IMAGES) return null;
  let total = 0;
  const images: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !IMAGE_PATTERN.test(item) || item.length > MAX_SINGLE_IMAGE_CHARS) return null;
    total += item.length;
    if (total > MAX_TOTAL_IMAGE_CHARS) return null;
    images.push(item);
  }
  return images;
}

export function normalizeBubbleSide(value: unknown): MeBubbleSide {
  return value === "left" || value === "auto" ? value : "right";
}
