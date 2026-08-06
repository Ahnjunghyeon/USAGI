"use client";
import { useLocale } from "@/components/LocaleProvider";

const LABELS = {
  ko: "생성형 AI 분석 결과",
  en: "Generative AI result",
  ja: "生成AIによる分析結果",
  zh: "生成式 AI 分析结果",
} as const;

export default function AiResultBadge() {
  const { locale } = useLocale();
  return <div className="ai-result-badge" role="note"><span aria-hidden="true">AI</span>{LABELS[locale]}</div>;
}
