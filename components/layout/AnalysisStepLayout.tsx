"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale } from "@/components/LocaleProvider";
export default function AnalysisStepLayout({ backHref, step, titleKey, descriptionKey, children }: { backHref: string; step: string; titleKey: string; descriptionKey: string; children: ReactNode }) { const {t}=useLocale(); return <main className="shell"><div className="mobile-frame"><div className="mini-nav"><Link className="back" href={backHref} aria-label={t("back")}>←</Link><span className="progress">{step}</span></div><h1 className="section-title">{t(titleKey)}</h1><p className="section-copy">{t(descriptionKey)}</p>{children}</div></main> }
