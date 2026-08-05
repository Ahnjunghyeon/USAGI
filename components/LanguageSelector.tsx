"use client";
import { LOCALE_OPTIONS, type Locale } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
export default function LanguageSelector(){const {locale,setLocale,t}=useLocale();return <label className="language-picker"><span>{t("language")}</span><select aria-label={t("language")} value={locale} onChange={e=>setLocale(e.target.value as Locale)}>{LOCALE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>}
