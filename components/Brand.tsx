"use client";
import Image from "next/image";
import { useLocale } from "@/components/LocaleProvider";
type BrandProps = { badge?: string; compact?: boolean; hero?: boolean };
export default function Brand({ badge, compact = false, hero = false }: BrandProps) { const {t}=useLocale(); return <header className={`brand ${compact ? "brand-compact" : ""} ${hero ? "brand-hero" : ""}`}><div className="logo"><Image className="brand-icon" src="/ui/usagi-logo.webp" width={hero ? 58 : 38} height={hero ? 58 : 38} alt="Usagi" priority/><div className="brand-wordmark"><strong>우사기<span className="brand-flower">✿</span></strong><span>{t("brandSubtitle")}</span></div></div>{badge && <span className="chip">{badge}</span>}</header> }
