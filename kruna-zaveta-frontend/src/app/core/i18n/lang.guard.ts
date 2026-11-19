import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { I18n } from './i18n.service';
import { DEFAULT_LANG, isLang } from './languages';

/** Activates the language from the `:lang` URL segment, or redirects unknown languages to the default. */
export const langGuard: CanActivateFn = (route) => {
  const lang = route.paramMap.get('lang');
  if (!isLang(lang)) {
    return inject(Router).createUrlTree(['/', DEFAULT_LANG]);
  }
  inject(I18n).use(lang);
  return true;
};
