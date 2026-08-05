"use client";
import Processing from "@/components/Processing";import {useLocale} from "@/components/LocaleProvider";
export default function Page(){const {t}=useLocale();return <main className="shell processing-shell"><div className="mobile-frame processing-frame"><div className="eyebrow">{t("processingEyebrow")}</div><h1 className="section-title">{t("processingTitle1")}<br/>{t("processingTitle2")}</h1><Processing/></div></main>}
