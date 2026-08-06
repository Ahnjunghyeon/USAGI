"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/ui/Button";
import { SelectField } from "@/components/ui/FormControls";
import {
  ANALYSIS_GOALS,
  GROUP_ANALYSIS_GOALS,
  RELATIONSHIP_DURATION_OPTIONS,
  RELATIONSHIPS,
  type ConversationMode,
  type RelationshipType,
} from "@/lib/context";
import { inputDraftStorage } from "@/lib/client/storage";
import { setupDraftStorage } from "@/lib/client/setup-storage";
import { useLocale } from "@/components/LocaleProvider";

const emoji: Record<RelationshipType, string> = {
  썸: "😍",
  연인: "❤️",
  소개팅: "👀",
  "애매한 사이": "🤨",
  전애인: "💔",
  친구: "🧑‍🤝‍🧑",
};

export default function ContextForm() {
  const router = useRouter();
  const { t, value } = useLocale();
  const [input, setInput] = useState<ReturnType<typeof inputDraftStorage.read>>(null);
  const [mode, setMode] = useState<ConversationMode>("direct");
  const [relationship, setRelationship] = useState<RelationshipType>("썸");
  const [duration, setDuration] = useState(RELATIONSHIP_DURATION_OPTIONS.썸[1]);
  const [goal, setGoal] = useState(ANALYSIS_GOALS.썸[4]);
  const [groupGoal, setGroupGoal] = useState<string>(GROUP_ANALYSIS_GOALS[4]);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    const draft = inputDraftStorage.read();
    const previous = setupDraftStorage.read();
    if (!draft) {
      router.replace("/analyze");
      return;
    }
    setInput(draft);
    if (previous) {
      setMode(previous.mode);
      setRelationship(previous.relationship);
      setDuration(previous.duration);
      setGoal(previous.goal);
      if (previous.groupGoal) setGroupGoal(previous.groupGoal);
      return;
    }
    if (draft?.detectedMode === "group") setMode("group");
  }, [router]);

  const durations = useMemo(() => RELATIONSHIP_DURATION_OPTIONS[relationship], [relationship]);
  const goals = useMemo(() => ANALYSIS_GOALS[relationship], [relationship]);

  const selectRelationship = (nextRelationship: RelationshipType) => {
    setRelationship(nextRelationship);
    setDuration(RELATIONSHIP_DURATION_OPTIONS[nextRelationship][0]);
    setGoal(ANALYSIS_GOALS[nextRelationship].at(-1) ?? "전체적으로 봐주세요");
  };

  const next = () => {
    const saved = setupDraftStorage.write({
      mode,
      relationship: mode === "group" ? "친구" : relationship,
      duration: mode === "group" ? RELATIONSHIP_DURATION_OPTIONS.친구[0] : duration,
      goal: mode === "group" ? ANALYSIS_GOALS.친구.at(-1) ?? "전체적으로 봐주세요" : goal,
      groupGoal: mode === "group" ? groupGoal : undefined,
    });
    if (!saved) {
      setStorageError(t("draftStorageFailed"));
      return;
    }
    setStorageError("");
    router.push("/analyze/details");
  };

  return (
    <>
      {storageError && <div className="upload-error" role="alert">{storageError}</div>}
      {input?.method === "text" && input.participants.length > 0 && (
        <div className="detected-chat-banner" role="status">
          <strong>{input.detectedMode === "group" ? t("detectedPeople", { n: input.participants.length }) : t("detectedDirect")}</strong>
          <span>{input.participants.join(" · ")}</span>
        </div>
      )}

      <section className="form-card stack conversation-mode-card">
        <div>
          <div className="card-kicker">{t("firstLook")}</div>
          <h2 className="form-title">{t("situationTitle")}</h2>
          <p className="form-help">{t("situationHelp")}</p>
        </div>
        <div className="conversation-mode-grid" role="group" aria-label={t("situationTitle")}>
          <button
            type="button"
            className={`conversation-mode-option ${mode === "direct" ? "selected" : ""}`}
            aria-pressed={mode === "direct"}
            onClick={() => setMode("direct")}
          >
            <strong>{t("direct")}</strong><small>{t("directDesc")}</small>
          </button>
          <button
            type="button"
            className={`conversation-mode-option ${mode === "group" ? "selected" : ""}`}
            aria-pressed={mode === "group"}
            onClick={() => setMode("group")}
          >
            <strong>{t("group")}</strong><small>{t("groupDesc")}</small>
          </button>
        </div>
      </section>

      {mode === "direct" ? (
        <>
          <div className="guide-inline">
            <span aria-hidden="true">🐰</span>
            <div><strong>{t("relationshipGuide")}</strong><small>{t("relationshipGuideSub")}</small></div>
          </div>
          <div className="option-grid" role="group" aria-label={t("relationshipGuide")}>
            {RELATIONSHIPS.map((label) => (
              <button
                type="button"
                key={label}
                className={`option ${relationship === label ? "selected" : ""}`}
                aria-pressed={relationship === label}
                onClick={() => selectRelationship(label)}
              >
                <span aria-hidden="true">{emoji[label]}</span><div><strong>{value(label)}</strong></div>
              </button>
            ))}
          </div>
          <div className="form-card stack">
            <SelectField label={t("durationLabel")} value={duration} onChange={setDuration}>
              {durations.map((option) => <option key={option} value={option}>{value(option)}</option>)}
            </SelectField>
            <SelectField label={t("goalLabel")} value={goal} onChange={setGoal}>
              {goals.map((option) => <option key={option} value={option}>{value(option)}</option>)}
            </SelectField>
          </div>
        </>
      ) : (
        <section className="form-card stack">
          <div>
            <div className="card-kicker">{t("groupKicker")}</div>
            <h2 className="form-title">{t("groupTitle")}</h2>
            <p className="form-help">{t("groupHelp")}</p>
          </div>
          <SelectField label={t("groupGoalLabel")} value={groupGoal} onChange={setGroupGoal}>
            {GROUP_ANALYSIS_GOALS.map((option) => <option key={option} value={option}>{value(option)}</option>)}
          </SelectField>
        </section>
      )}

      <div className="bottom-actions"><AppButton fullWidth onClick={next}>{t("next")}</AppButton></div>
    </>
  );
}
