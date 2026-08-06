"use client";
import type { ReactNode } from "react";
import { useLocale } from "@/components/LocaleProvider";
import type { MessageKey } from "@/lib/i18n";
import ProgressHeader from "@/components/ui/ProgressHeader";
export default function AnalysisStepLayout({backHref,step,titleKey,descriptionKey,children}:{backHref:string;step:string;titleKey:MessageKey;descriptionKey:MessageKey;children:ReactNode}){const {t}=useLocale();const current=Math.max(1,Math.min(3,Number.parseInt(step,10)||3));return <main className="shell"><div className="mobile-frame"><ProgressHeader backHref={backHref} current={current}/><section className="uds-page-heading"><h1 className="section-title">{t(titleKey)}</h1><p className="section-copy">{t(descriptionKey)}</p></section>{children}</div></main>}
