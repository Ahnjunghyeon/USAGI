"use client";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";

const TOTAL=3;
export default function ProgressHeader({backHref,current}:{backHref:string;current:number}){const {t}=useLocale();return <div className="uds-progress-header"><Link className="uds-back" href={backHref} aria-label={t("back")}>‹</Link><div className="uds-progress-track" aria-label={`${current} / ${TOTAL}`}>{Array.from({length:TOTAL},(_,i)=><span key={i} className={i<current?"filled":""}/>)}</div><span className="uds-progress-count">{current}/{TOTAL}</span></div>}
