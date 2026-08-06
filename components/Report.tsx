"use client";

import { useEffect, useMemo, useState } from "react";
import Brand from "@/components/Brand";
import BrandFeature from "@/components/BrandFeature";
import ResultHeader from "@/components/report/ResultHeader";
import BalanceCard from "@/components/report/BalanceCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { AppButton, ButtonLink } from "@/components/ui/Button";
import { resultStorage, type StoredAnalysisResult } from "@/lib/client/storage";
import { MBTI_PROFILES, type MbtiType } from "@/lib/mbti";
import { useLocale } from "@/components/LocaleProvider";

type ReportResult = StoredAnalysisResult;

function ShareActions({ result }: { result: ReportResult }) {
  const { t } = useLocale();
  const ctx = result.context;

  const share = async () => {
    const standout = result.groupAnalysis?.standoutName
      ? `\n${result.groupAnalysis.standoutName}: ${result.groupAnalysis.standoutReason}`
      : "";
    const text = `USAGI · AI RESULT\n${result.summary}${standout}\n\n${ctx.aiFriend.name}: ${result.friendComment}\n\nAI-generated reference analysis; it does not verify feelings or intent.`;

    if (navigator.share) {
      await navigator.share({ title: "USAGI", text }).catch(() => {});
      return;
    }

    await navigator.clipboard.writeText(text).catch(() => {});
    alert(t("copied"));
  };

  return (
    <div className="result-actions" aria-label="결과 작업">
      <AppButton fullWidth onClick={share}>{t("share")}</AppButton>
      <ButtonLink fullWidth href="/analyze">{t("reanalyze")}</ButtonLink>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon?: "focus" | "relation" | "pattern";
  title: string;
  description?: string;
}) {
  return (
    <div className="result-section-heading">
      {icon && <BrandFeature variant={icon} size={30} />}
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

function FriendCard({ result, group = false }: { result: ReportResult; group?: boolean }) {
  const { t, value } = useLocale();
  const ctx = result.context;

  return (
    <Card tone="accent" className="friend-card result-card uds-reveal">
      <div className="friend-header">
        <div className="friend-identity">
          <div className="friend-label">
            <BrandFeature variant="pattern" size={30} />
            <span>{ctx.aiFriend.name}{t("friendWord")}</span>
          </div>
          <div className="friend-meta">
            {value(ctx.aiFriend.ageRange)} · {value(ctx.aiFriend.gender)} · {ctx.aiFriend.mbti}
          </div>
        </div>
        <Badge tone="ai">{t("aiFriend")}</Badge>
      </div>

      <blockquote className="friend-quote">“{result.friendComment}”</blockquote>
      <p className="friend-tip">{group ? t("groupFriendTip") : t("friendTip")}</p>
    </Card>
  );
}

function HighlightSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="result-plain-section uds-reveal">
      <SectionHeading icon="focus" title={title} />
      <div className="highlight-list">
        {items.map((item) => <p key={item}>{item}</p>)}
      </div>
    </section>
  );
}

function GroupReport({ result }: { result: ReportResult }) {
  const { t, value } = useLocale();
  const ctx = result.context;
  const group = result.groupAnalysis;
  const tags = [
    t("groupChat"),
    value(ctx.groupGoal ?? "전체적으로 봐주세요"),
    t("detectedPeople", { n: group?.participantCount ?? 0 }),
  ];
  const meta = `${t("groupSummary")} · ${t("messages", { n: result.extractedMessageCount })} · ${t("dataAmount")} ${value(result.dataAmount)}`;

  return (
    <main className="shell report-shell">
      <div className="mobile-frame report-frame">
        <Brand />
        <ResultHeader tags={tags} meta={meta} title={t("groupFlow")} summary={result.summary} />

        {group?.standoutName && (
          <Card tone="accent" className="group-standout-card result-card uds-reveal">
            <span className="group-standout-kicker">{t("foundPerson")}</span>
            <h2 className="group-standout-name">{group.standoutName}</h2>
            <p>{group.standoutReason}</p>
          </Card>
        )}

        <HighlightSection title={t("groupObserved")} items={result.highlights} />

        {group && group.participantNotes.length > 0 && (
          <section className="result-plain-section group-people-section uds-reveal">
            <SectionHeading title={t("peopleFeeling")} description={t("peopleFeelingSub")} />
            <div className="group-person-list">
              {group.participantNotes.map((item) => (
                <div className="group-person-row" key={`${item.name}-${item.note}`}>
                  <strong>{item.name}</strong>
                  <span>{item.note}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <FriendCard result={result} group />
        <div className="notice result-notice uds-reveal">{t("groupNotice")}</div>
        <ShareActions result={result} />
      </div>
    </main>
  );
}

export default function Report() {
  const { t, value, locale } = useLocale();
  const [result, setResult] = useState<ReportResult | null>(null);
  const [mbtiFeedback, setMbtiFeedback] = useState<"similar" | "different" | null>(null);

  useEffect(() => setResult(resultStorage.read() as ReportResult | null), []);

  const profile = useMemo(
    () =>
      result &&
      result.context.mode !== "group" &&
      result.context.other.mbti !== "모름"
        ? MBTI_PROFILES[result.context.other.mbti as MbtiType]
        : null,
    [result],
  );

  if (!result) {
    return (
      <main className="shell">
        <div className="mobile-frame">
          <Brand />
          <div className="empty-result">
            <h1>{t("reportNoResult")}</h1>
            <p>{t("reportNoResultSub")}</p>
            <ButtonLink href="/analyze" variant="primary">{t("start")}</ButtonLink>
          </div>
        </div>
      </main>
    );
  }

  if (result.context.mode === "group") return <GroupReport result={result} />;

  const { context: ctx, metrics } = result;
  const tags = [
    value(ctx.relationship),
    value(ctx.duration),
    value(ctx.goal),
    `${t("other")} ${value(ctx.other.ageRange)} · ${value(ctx.other.gender)} · ${ctx.other.mbti}`,
  ];
  const meta = `${t("analysisSummary")} · ${t("messages", { n: result.extractedMessageCount })} · ${t("dataAmount")} ${value(result.dataAmount)}`;

  return (
    <main className="shell report-shell">
      <div className="mobile-frame report-frame">
        <Brand />
        <ResultHeader tags={tags} meta={meta} title={t("currentFlow")} summary={result.summary} />

        <BalanceCard
          title={t("balance")}
          subtitle={t("balanceSub")}
          meLabel={t("me")}
          otherLabel={t("other")}
          mePercent={metrics.messageBalance.me}
          otherPercent={metrics.messageBalance.other}
          meCount={metrics.messageCount.me}
          otherCount={metrics.messageCount.other}
        />

        <div className="result-stat-grid uds-reveal">
          <Card className="result-stat-card">
            <span>{t("questionFreq")}</span>
            <strong className="stat-value-lines"><span>{t("me")} {metrics.questionCount.me}</span><span>{t("other")} {metrics.questionCount.other}</span></strong>
            <small>{t("questionSub")}</small>
          </Card>
          <Card className="result-stat-card">
            <span>{t("avgLength")}</span>
            <strong className="stat-value-lines"><span>{t("me")} {metrics.averageMessageLength.me}</span><span>{t("other")} {metrics.averageMessageLength.other}</span></strong>
            <small>{t("avgLengthSub")}</small>
          </Card>
        </div>

        <HighlightSection title={t("observed")} items={result.highlights} />
        <FriendCard result={result} />

        {profile && (
          <Card className="mbti-person-card result-card uds-reveal">
            <div className="result-card-head">
              <div>
                <div className="metric-title metric-title-with-icon">
                  <BrandFeature variant="relation" size={34} />
                  <span>{ctx.other.mbti}</span>
                </div>
                <p>{t("mbtiReference")}</p>
              </div>
            </div>

            {locale === "ko" && (
              <>
                <p className="mbti-person-copy">{profile.feature} {profile.conversationStyle}</p>
                <div className="mbti-tag-row">
                  {profile.strengths.map((item) => <span key={item}>{item}</span>)}
                </div>
                <div className="mbti-caution">
                  <strong>{t("mbtiCaution")}</strong>
                  <span>{profile.cautions.join(" · ")}</span>
                </div>
              </>
            )}

            <p className="mbti-link-copy">
              <strong>{t("inThisAnalysis")}</strong><span>{t("mbtiNote")}</span>
            </p>

            <div className="mbti-feedback">
              <button
                type="button"
                className={mbtiFeedback === "similar" ? "selected" : ""}
                onClick={() => setMbtiFeedback("similar")}
              >
                {t("similar")}
              </button>
              <button
                type="button"
                className={mbtiFeedback === "different" ? "selected" : ""}
                onClick={() => setMbtiFeedback("different")}
              >
                {t("different")}
              </button>
            </div>

            <div className="mbti-more">
              <ButtonLink href="/analyze" variant="ghost" size="sm" className="mbti-more-link">
                {t("moreChat")}
              </ButtonLink>
            </div>
          </Card>
        )}

        <div className="notice result-notice uds-reveal">{t("reportNotice")}</div>
        <ShareActions result={result} />
      </div>
    </main>
  );
}
