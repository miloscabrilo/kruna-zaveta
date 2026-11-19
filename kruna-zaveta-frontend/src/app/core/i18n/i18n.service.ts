import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { de } from './de';
import { en, Translations } from './en';
import { DEFAULT_LANG, Lang, Localized, isLang } from './languages';
import { sr } from './sr';

const DICTIONARIES: Record<Lang, Translations> = { sr, en, de };

const LOCALES: Record<Lang, string> = { sr: 'sr-Cyrl-RS', en: 'en-GB', de: 'de-DE' };

const STORAGE_KEY = 'kruna-zaveta.lang';

@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  private readonly current = signal<Lang>(DEFAULT_LANG);

  readonly lang = this.current.asReadonly();
  readonly locale = computed(() => LOCALES[this.current()]);
  private readonly dictionary = computed(() => DICTIONARIES[this.current()]);

  use(lang: Lang): void {
    this.current.set(lang);
    this.document.documentElement.lang = lang;
    this.meta.updateTag({ name: 'description', content: this.t('meta.description') });
  }

  /** Remembers the language the visitor picked, so the next visit to "/" opens in it. */
  savePreference(lang: Lang): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage blocked (private mode, disabled cookies) – the choice just isn't remembered.
    }
  }

  /** The remembered language, or the default. Only meaningful in the browser (no storage on the server). */
  preferredLanguage(): Lang {
    try {
      const saved = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return isLang(saved) ? saved : DEFAULT_LANG;
    } catch {
      return DEFAULT_LANG;
    }
  }

  /** Looks up a dot-separated key, e.g. `t('nav.home')`. Falls back to the key itself. */
  t(key: string): string {
    let node: unknown = this.dictionary();
    for (const part of key.split('.')) {
      node = node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined;
    }
    return typeof node === 'string' ? node : key;
  }

  /** Picks the current language's value from content that exists in every language. */
  pick<T>(value: Localized<T>): T {
    return value[this.current()];
  }

  setPageTitle(pageTitle?: string): void {
    const site = this.t('meta.siteName');
    this.title.setTitle(pageTitle ? `${pageTitle} | ${site}` : `${site} – ${this.t('meta.tagline')}`);
  }

  formatDate(isoDate: string): string {
    return new Intl.DateTimeFormat(this.locale(), { dateStyle: 'long' }).format(new Date(isoDate));
  }
}
