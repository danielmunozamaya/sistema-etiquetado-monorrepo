// i18n/index.ts
import { es } from './es';
import { pt } from './pt';
import { Dictionary } from 'src/common/types/i18n.types';

const dictionaries = {
  es,
  pt,
};

const defaultString = '[[invalid_key_or_params]]';

function safeGetter<T extends (...args: any[]) => string>(
  fn: T | undefined
): (...args: Parameters<T>) => string {
  return (...args: Parameters<T>) => {
    try {
      return typeof fn === 'function' ? fn(...args) : defaultString;
    } catch {
      return defaultString;
    }
  };
}

type I18nProxy<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => string
    ? (...args: Parameters<T[K]>) => string
    : I18nProxy<T[K]>;
};

export function i18nFactory<T extends Dictionary>(
  lang: keyof typeof dictionaries
): I18nProxy<T> {
  const langDict = dictionaries[lang] ?? es;

  const wrap = (section: any): any => {
    const wrapped = {} as any;
    for (const key in section) {
      if (typeof section[key] === 'function') {
        wrapped[key] = safeGetter(section[key]);
      } else if (typeof section[key] === 'object') {
        wrapped[key] = wrap(section[key]);
      }
    }
    return wrapped;
  };

  return wrap(langDict);
}
