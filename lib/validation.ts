import {
  AGE_RANGES,
  ANALYSIS_GOALS,
  GENDERS,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPerson(value: unknown): value is UrIsaiContext["me"] {
  if (!isRecord(value)) return false;
  return ageSet.has(String(value.ageRange)) && genderSet.has(String(value.gender)) && mbtiSet.has(String(value.mbti));
}

export function validateAndNormalizeContext(value: unknown): UrIsaiContext | null {
  if (!isRecord(value)) return null;
  const relationship = String(value.relationship) as RelationshipType;
  if (!relationshipSet.has(relationship)) return null;
  if (!(RELATIONSHIP_DURATION_OPTIONS[relationship] as readonly string[]).includes(String(value.duration))) return null;
  if (!(ANALYSIS_GOALS[relationship] as readonly string[]).includes(String(value.goal))) return null;
  if (!isPerson(value.me) || !isPerson(value.other) || !isRecord(value.aiFriend)) return null;

  const presetId = typeof value.aiFriend.presetId === "string" ? value.aiFriend.presetId : "custom";
  const preset = getAiFriendPreset(presetId);
  const isKnownPreset = AI_FRIEND_PRESETS.some((item) => item.id === presetId);
  if (!isKnownPreset) return null;

  if (presetId !== "custom") {
    return {
      relationship,
      duration: String(value.duration),
      goal: String(value.goal),
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
    relationship,
    duration: String(value.duration),
    goal: String(value.goal),
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
