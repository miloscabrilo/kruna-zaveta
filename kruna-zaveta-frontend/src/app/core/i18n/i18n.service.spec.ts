import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { I18n } from './i18n.service';

describe('I18n', () => {
  let i18n: I18n;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    i18n = TestBed.inject(I18n);
  });

  it('translates keys in the active language', () => {
    i18n.use('sr');
    expect(i18n.t('nav.about')).toBe('О нама');
    i18n.use('de');
    expect(i18n.t('nav.about')).toBe('Über uns');
  });

  it('falls back to the key when it is missing', () => {
    expect(i18n.t('does.not.exist')).toBe('does.not.exist');
  });

  it('remembers the chosen language', () => {
    localStorage.removeItem('kruna-zaveta.lang');
    expect(i18n.preferredLanguage()).toBe('sr');
    i18n.savePreference('de');
    expect(i18n.preferredLanguage()).toBe('de');
    localStorage.removeItem('kruna-zaveta.lang');
  });

  it('ignores an invalid saved language', () => {
    localStorage.setItem('kruna-zaveta.lang', 'fr');
    expect(i18n.preferredLanguage()).toBe('sr');
    localStorage.removeItem('kruna-zaveta.lang');
  });

  it('sets the document language', () => {
    i18n.use('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
