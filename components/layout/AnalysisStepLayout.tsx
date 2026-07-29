import Link from "next/link";
import type { ReactNode } from "react";

export default function AnalysisStepLayout({ backHref, step, title, description, children }: { backHref: string; step: string; title: string; description: string; children: ReactNode }) {
  return <main className="shell"><div className="mobile-frame">
    <div className="mini-nav"><Link className="back" href={backHref} aria-label="이전 단계">←</Link><span className="progress">{step}</span></div>
    <h1 className="section-title">{title}</h1>
    <p className="section-copy">{description}</p>
    {children}
  </div></main>;
}
