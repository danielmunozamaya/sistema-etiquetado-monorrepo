import es from "./es";
import pt from "./pt";
import type { I18nDictionary } from "./types";

const defaultLang = import.meta.env.VITE_APP_LANGUAGE || "es";
const dictionaries: Record<string, I18nDictionary> = { es, pt };

const defaultString = "[[invalid_key_or_params]]";

function safeGetter(fn: (...args: any[]) => any) {
  return (...args: any[]) => {
    try {
      return typeof fn === "function" ? fn(...args) : defaultString;
    } catch {
      return defaultString;
    }
  };
}

const wrapSection = (section: Record<string, any>) => {
  const wrapped: Record<string, any> = {};
  for (const key in section) {
    const value = section[key];
    wrapped[key] = typeof value === "function" ? safeGetter(value) : value;
  }
  return wrapped;
};

const langDict: I18nDictionary = dictionaries[defaultLang] || es;

export const i18n = new Proxy(langDict, {
  get(target, namespace: string) {
    const section = target[namespace as keyof I18nDictionary];
    if (!section || typeof section !== "object") return {};
    return wrapSection(section);
  },
}) as I18nDictionary;
