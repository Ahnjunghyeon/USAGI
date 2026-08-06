"use client";

import { useState } from "react";
import { LOCALE_OPTIONS, type Locale } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import BottomSheet from "@/components/ui/BottomSheet";

export default function LanguageSelector() {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const selected = LOCALE_OPTIONS.find((option) => option.value === locale);

  return (
    <>
      <button type="button" className="language-trigger" onClick={() => setOpen(true)} aria-label={`${t("language")}: ${selected?.label ?? locale}`}>
        <span aria-hidden="true">🌐</span><strong>{selected?.label}</strong>
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={t("language")} closeLabel={t("close")}>
        <div className="language-sheet-list" role="group" aria-label={t("language")}>
          {LOCALE_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.value}
              className={option.value === locale ? "selected" : ""}
              aria-pressed={option.value === locale}
              onClick={() => { setLocale(option.value as Locale); setOpen(false); }}
            >
              <span>{option.label}</span>{option.value === locale && <strong aria-hidden="true">✓</strong>}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
