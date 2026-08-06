"use client";

import AiResultBadge from "@/components/AiResultBadge";
import Badge from "@/components/ui/Badge";

type ResultHeaderProps = {
  tags: string[];
  meta: string;
  title: string;
  summary: string;
};

export default function ResultHeader({ tags, meta, title, summary }: ResultHeaderProps) {
  return (
    <header className="result-hero uds-reveal">
      <AiResultBadge />

      <div className="result-context-panel">
        <div className="result-tag-row" aria-label="분석 조건">
          {tags.filter(Boolean).map((tag) => <Badge key={tag}>{tag}</Badge>)}
        </div>
        <p className="result-meta">{meta}</p>
      </div>

      <div className="result-copy-block">
        <h1 className="result-title">{title}</h1>
        <p className="result-summary">{summary}</p>
      </div>
    </header>
  );
}
