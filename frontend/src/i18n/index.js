import es from "./es";
import pt from "./pt";

const defaultLang = import.meta.env.VITE_APP_LANGUAGE || "es";
const dictionaries = { es, pt };

const defaultString = "[[invalid_key_or_params]]";

function safeGetter(fn) {
  return (...args) => {
    try {
      return typeof fn === "function" ? fn(...args) : defaultString;
    } catch {
      return defaultString;
    }
  };
}

const wrapSection = (section) => {
  const wrapped = {};
  for (const key in section) {
    const value = section[key];
    wrapped[key] = typeof value === "function" ? safeGetter(value) : value;
  }
  return wrapped;
};

const langDict = dictionaries[defaultLang] || es;

export const i18n = new Proxy(
  {},
  {
    get(_, namespace) {
      const section = langDict[namespace];
      if (!section || typeof section !== "object") return {};
      return wrapSection(section);
    },
  }
);
