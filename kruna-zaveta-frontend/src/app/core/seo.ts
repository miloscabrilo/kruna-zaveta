import { DOCUMENT, Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { SITE } from './content/site';
import { DEFAULT_LANG, LANGUAGES, isLang } from './i18n/languages';

/**
 * Keeps <link rel="canonical"> and the hreflang alternates in sync with the current page,
 * so search engines treat /sr, /en and /de as translations of the same page.
 */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly document = inject(DOCUMENT);

  init(router: Router = inject(Router)): void {
    router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => this.update(event.urlAfterRedirects));
  }

  private update(url: string): void {
    const [lang, ...rest] = url.split(/[?#]/)[0].split('/').filter(Boolean);
    if (!isLang(lang)) {
      return;
    }
    const path = rest.length ? `/${rest.join('/')}` : '';
    const href = (l: string) => `${SITE.url}/${l}${path}`;

    this.setLink('canonical', href(lang));
    for (const alternate of LANGUAGES) {
      this.setLink('alternate', href(alternate), alternate);
    }
    this.setLink('alternate', href(DEFAULT_LANG), 'x-default');
  }

  private setLink(rel: string, href: string, hreflang?: string): void {
    const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
    let link = this.document.head.querySelector<HTMLLinkElement>(selector);
    if (!link) {
      link = this.document.createElement('link');
      link.rel = rel;
      if (hreflang) {
        link.hreflang = hreflang;
      }
      this.document.head.appendChild(link);
    }
    link.href = href;
  }
}
