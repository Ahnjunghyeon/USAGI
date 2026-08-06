"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { tr, tv, type Locale, type MessageKey } from "@/lib/i18n";

const KEY = "usagi-locale";
type LocaleContextValue = {
  locale: Locale;
  ready: boolean;
  setLocale: (value: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  value: (value: string) => string;
};
const Ctx = createContext<LocaleContextValue>({ locale: "ko", ready: false, setLocale: () => {}, t: (key) => key, value: (value) => value });

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ko");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved && ["ko", "en", "ja", "zh"].includes(saved)) setLocaleState(saved as Locale);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = locale;
    window.localStorage.setItem(KEY, locale);
  }, [locale, ready]);

  const value = useMemo(() => ({
    locale,
    ready,
    setLocale: setLocaleState,
    t: (key: MessageKey, vars?: Record<string, string | number>) => tr(locale, key, vars),
    value: (text: string) => tv(locale, text),
  }), [locale, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocale() { return useContext(Ctx); }
