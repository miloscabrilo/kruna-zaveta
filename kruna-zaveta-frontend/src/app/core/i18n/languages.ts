export const LANGUAGES = ['sr', 'en', 'de'] as const;

export type Lang = (typeof LANGUAGES)[number];

export const DEFAULT_LANG: Lang = 'sr';

export const LANGUAGE_LABELS: Record<Lang, { short: string; name: string }> = {
  sr: { short: 'SR', name: 'Српски' },
  en: { short: 'EN', name: 'English' },
  de: { short: 'DE', name: 'Deutsch' },
};

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/** Text that exists in every supported language. */
export type Localized<T = string> = Record<Lang, T>;
