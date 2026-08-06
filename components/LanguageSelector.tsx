"use client";
import { useState } from "react";
import { LOCALE_OPTIONS, type Locale } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import BottomSheet from "@/components/ui/BottomSheet";
export default function LanguageSelector(){const {locale,setLocale,t}=useLocale();const [open,setOpen]=useState(false);const selected=LOCALE_OPTIONS.find(o=>o.value===locale);return <><button type="button" className="language-trigger" onClick={()=>setOpen(true)} aria-label={t("language")}><span aria-hidden="true">🌐</span><strong>{selected?.label}</strong></button><BottomSheet open={open} onClose={()=>setOpen(false)} title={t("language")}><div className="language-sheet-list">{LOCALE_OPTIONS.map(o=><button type="button" key={o.value} className={o.value===locale?"selected":""} onClick={()=>{setLocale(o.value as Locale);setOpen(false)}}><span>{o.label}</span>{o.value===locale&&<strong>✓</strong>}</button>)}</div></BottomSheet></>}
