import en from "./translations/en.json";
import tr from "./translations/tr.json";

export type Locale = "en" | "tr";

export const translations: Record<Locale, Record<string, unknown>> = {
  en,
  tr,
};

export const defaultLocale: Locale = "en";

export function translate(locale: Locale, key: string): string {
  const segments = key.split(".");
  let current: unknown = translations[locale];
  for (const segment of segments) {
    if (current && typeof current === "object" && segment in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return key;
    }
  }
  return typeof current === "string" ? current : key;
}
