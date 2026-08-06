"use client";
import Processing from "@/components/Processing";
import NaturalText from "@/components/ui/NaturalText";import {useLocale} from "@/components/LocaleProvider";
export default function Page(){const {t}=useLocale();return <main className="shell processing-shell"><div className="mobile-frame processing-frame"><div className="eyebrow">{t("processingEyebrow")}</div><h1 className="section-title section-title-lines"><NaturalText as="span">{t("processingTitle1")}</NaturalText><NaturalText as="span">{t("processingTitle2")}</NaturalText></h1><Processing/></div></main>}
