import { getLocales } from "expo-localization";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { defaultLocale, translate, type Locale } from "@/i18n";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLocale(): Locale {
  const tag = getLocales()[0]?.languageCode ?? defaultLocale;
  return tag === "tr" ? "tr" : "en";
}

type Props = {
  children: ReactNode;
};

export function I18nProvider({ children }: Props) {
  const [locale, setLocale] = useState<Locale>(() => detectInitialLocale());

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => translate(locale, key),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used inside I18nProvider");
  }
  return ctx;
}
