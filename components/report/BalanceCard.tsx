"use client";

import Card from "@/components/ui/Card";

type BalanceCardProps = {
  title: string;
  subtitle: string;
  meLabel: string;
  otherLabel: string;
  mePercent: number;
  otherPercent: number;
  meCount: number;
  otherCount: number;
};

export default function BalanceCard({ title, subtitle, meLabel, otherLabel, mePercent, otherPercent, meCount, otherCount }: BalanceCardProps) {
  return <Card className="result-card balance-card uds-reveal">
    <div className="result-card-head">
      <div><h2>{title}</h2><p>{subtitle}</p></div>
      <strong className="balance-ratio">{mePercent}<span>:</span>{otherPercent}</strong>
    </div>
    <div className="balance-labels"><span>{meLabel} {mePercent}%</span><span>{otherPercent}% {otherLabel}</span></div>
    <div className="balance result-balance" style={{ gridTemplateColumns: `${Math.max(1, mePercent)}fr ${Math.max(1, otherPercent)}fr` }} aria-label={`${meLabel} ${mePercent}%, ${otherLabel} ${otherPercent}%`}>
      <div/><div/>
    </div>
    <div className="metric-foot"><span>{meLabel} {meCount}</span><span>{otherLabel} {otherCount}</span></div>
  </Card>;
}
