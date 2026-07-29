import {
  AGE_RANGES,
  ANALYSIS_GOALS,
  CONVERSATION_MODES,
  GENDERS,
  GROUP_ANALYSIS_GOALS,
  RELATIONSHIP_DURATION_OPTIONS,
  RELATIONSHIPS,
  type RelationshipType,
  type UrIsaiContext,
} from "@/lib/context";
import { AI_FRIEND_PRESETS, getAiFriendPreset } from "@/lib/friend-presets";
import { MBTI_TYPES, type MbtiValue } from "@/lib/mbti";

const ageSet = new Set<string>(AGE_RANGES);
const genderSet = new Set<string>(GENDERS);
const mbtiSet = new Set<string>([...MBTI_TYPES, "모름"]);
const relationshipSet = new Set<string>(RELATIONSHIPS);
const modeSet = new Set<string>(CONVERSATION_MODES);
const groupGoalSet = new Set<string>(GROUP_ANALYSIS_GOALS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPerson(value: unknown): value is UrIsaiContext["me"] {
  if (!isRecord(value)) return false;
  return ageSet.has(String(value.ageRange)) && genderSet.has(String(value.gender)) && mbtiSet.has(String(value.mbti));
}

export function validateAndNormalizeContext(value: unknown): UrIsaiContext | null {
  if (!isRecord(value)) return null;
  const modeRaw = typeof value.mode === "string" ? value.mode : "direct";
  if (!modeSet.has(modeRaw)) return null;
  const mode = modeRaw as UrIsaiContext["mode"];
  const relationship = String(value.relationship) as RelationshipType;
  if (!relationshipSet.has(relationship)) return null;
  if (!isPerson(value.me) || !isPerson(value.other) || !isRecord(value.aiFriend)) return null;
  if (mode === "direct") {
    if (!(RELATIONSHIP_DURATION_OPTIONS[relationship] as readonly string[]).includes(String(value.duration))) return null;
    if (!(ANALYSIS_GOALS[relationship] as readonly string[]).includes(String(value.goal))) return null;
  } else {
    if (!groupGoalSet.has(String(value.groupGoal))) return null;
  }

  const presetId = typeof value.aiFriend.presetId === "string" ? value.aiFriend.presetId : "custom";
  const preset = getAiFriendPreset(presetId);
  const isKnownPreset = AI_FRIEND_PRESETS.some((item) => item.id === presetId);
  if (!isKnownPreset) return null;

  if (presetId !== "custom") {
    return {
      mode,
      relationship: mode === "group" ? "친구" : relationship,
      groupGoal: mode === "group" ? String(value.groupGoal) : undefined,
      duration: mode === "group" ? RELATIONSHIP_DURATION_OPTIONS.친구[0] : String(value.duration),
      goal: mode === "group" ? ANALYSIS_GOALS.친구[4] : String(value.goal),
      me: value.me,
      other: value.other,
      aiFriend: {
        presetId: preset.id,
        name: preset.name,
        ageRange: preset.ageRange,
        gender: preset.gender,
        mbti: preset.mbti,
        persona: preset.persona,
      },
    };
  }

  const name = typeof value.aiFriend.name === "string" ? value.aiFriend.name.trim().slice(0, 20) : "우사기 친구";
  const ageRange = String(value.aiFriend.ageRange);
  const gender = String(value.aiFriend.gender);
  const mbti = String(value.aiFriend.mbti) as MbtiValue;
  if (!ageSet.has(ageRange) || !genderSet.has(gender) || !mbtiSet.has(mbti)) return null;

  return {
    mode,
    relationship: mode === "group" ? "친구" : relationship,
    groupGoal: mode === "group" ? String(value.groupGoal) : undefined,
    duration: mode === "group" ? RELATIONSHIP_DURATION_OPTIONS.친구[0] : String(value.duration),
    goal: mode === "group" ? ANALYSIS_GOALS.친구[4] : String(value.goal),
    me: value.me,
    other: value.other,
    aiFriend: {
      presetId: "custom",
      name: name || "우사기 친구",
      ageRange,
      gender,
      mbti,
      // custom persona is intentionally server-defined to avoid prompt injection via client payload.
      persona: preset.persona,
    },
  };
}
