"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import { AppButton } from "@/components/ui/Button";
import Toast from "@/components/ui/Toast";
import { useLocale } from "@/components/LocaleProvider";
import { feedbackStorage, type AnalysisFeedback as FeedbackValue, type FeedbackIssue, type FeedbackRating } from "@/lib/client/feedback";
import type { StoredAnalysisResult } from "@/lib/client/storage";

const ISSUE_KEYS: Array<[FeedbackIssue, "feedbackIssueSpeaker" | "feedbackIssueFlow" | "feedbackIssueTone" | "feedbackIssuePeople" | "feedbackIssueOther"]> = [
  ["speaker", "feedbackIssueSpeaker"],
  ["flow", "feedbackIssueFlow"],
  ["tone", "feedbackIssueTone"],
  ["people", "feedbackIssuePeople"],
  ["other", "feedbackIssueOther"],
];

export default function AnalysisFeedback({ result }: { result: StoredAnalysisResult }) {
  const { t } = useLocale();
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [issues, setIssues] = useState<FeedbackIssue[]>([]);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const current = feedbackStorage.read(result.id);
    if (!current) return;
    setRating(current.rating);
    setIssues(current.issues);
    setNote(current.note ?? "");
    setSaved(true);
  }, [result.id]);

  const showDetails = rating === "partial" || rating === "different";
  const canSubmit = Boolean(rating);
  const ratingOptions = useMemo<Array<[FeedbackRating, string]>>(() => [
    ["accurate", t("feedbackAccurate")],
    ["partial", t("feedbackPartial")],
    ["different", t("feedbackDifferent")],
  ], [t]);

  const toggleIssue = (issue: FeedbackIssue) => {
    setSaved(false);
    setIssues((current) => current.includes(issue) ? current.filter((item) => item !== issue) : [...current, issue]);
  };

  const submit = () => {
    if (!rating) return;
    const value: FeedbackValue = {
      analysisId: result.id,
      createdAt: new Date().toISOString(),
      rating,
      issues: showDetails ? issues : [],
      note: showDetails && note.trim() ? note.trim().slice(0, 300) : undefined,
      inputType: result.source?.inputType,
      mode: result.context.mode,
      confidence: result.source?.confidence,
    };
    const ok = feedbackStorage.write(value);
    setSaved(ok);
    setToast(ok ? t("feedbackSaved") : t("feedbackSaveFailed"));
  };

  return (
    <>
      <Card className="analysis-feedback result-card uds-reveal">
        <div className="analysis-feedback-head">
          <h2>{t("feedbackTitle")}</h2>
          <p>{t("feedbackDescription")}</p>
        </div>

        <div className="feedback-rating-grid" role="radiogroup" aria-label={t("feedbackTitle")}>
          {ratingOptions.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              className={rating === value ? "selected" : ""}
              onClick={() => { setRating(value); setSaved(false); }}
            >
              {label}
            </button>
          ))}
        </div>

        {showDetails && (
          <div className="feedback-details">
            <p className="feedback-details-label">{t("feedbackIssueTitle")}</p>
            <div className="feedback-issue-grid" role="group" aria-label={t("feedbackIssueTitle")}>
              {ISSUE_KEYS.map(([issue, key]) => (
                <button key={issue} type="button" aria-pressed={issues.includes(issue)} className={issues.includes(issue) ? "selected" : ""} onClick={() => toggleIssue(issue)}>
                  {t(key)}
                </button>
              ))}
            </div>
            <label className="feedback-note-label" htmlFor="analysis-feedback-note">{t("feedbackNoteLabel")}</label>
            <textarea id="analysis-feedback-note" value={note} maxLength={300} onChange={(event) => { setNote(event.target.value); setSaved(false); }} placeholder={t("feedbackNotePlaceholder")} />
          </div>
        )}

        <div className="feedback-submit-row">
          <AppButton size="sm" disabled={!canSubmit || saved} onClick={submit}>
            {saved ? t("feedbackSavedButton") : t("feedbackSubmit")}
          </AppButton>
          <small>{t("feedbackPrivacy")}</small>
        </div>
      </Card>
      <Toast message={toast} onDismiss={() => setToast("")} />
    </>
  );
}
