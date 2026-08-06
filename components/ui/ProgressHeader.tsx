"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

const TOTAL = 3;

export default function ProgressHeader({ backHref, current }: { backHref: string; current: number }) {
  const { t } = useLocale();
  const safeCurrent = Math.min(TOTAL, Math.max(0, current));
  return (
    <div className="uds-progress-header">
      <Link className="uds-back" href={backHref} aria-label={t("back")}>‹</Link>
      <div
        className="uds-progress-track"
        role="progressbar"
        aria-label={t("progressLabel")}
        aria-valuemin={0}
        aria-valuemax={TOTAL}
        aria-valuenow={safeCurrent}
        aria-valuetext={`${safeCurrent} / ${TOTAL}`}
      >
        {Array.from({ length: TOTAL }, (_, index) => (
          <span key={index} className={index < safeCurrent ? "filled" : ""} aria-hidden="true" />
        ))}
      </div>
      <span className="uds-progress-count" aria-hidden="true">{safeCurrent}/{TOTAL}</span>
    </div>
  );
}
