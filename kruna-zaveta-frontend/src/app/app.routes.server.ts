import { RenderMode, ServerRoute } from '@angular/ssr';
import { PAGE_PATHS } from './app.routes';
import { NEWS } from './core/content/news';
import { LANGUAGES } from './core/i18n/languages';

const everyLanguage = async () => LANGUAGES.map((lang) => ({ lang }));

/** Every page is prerendered to static HTML in every language. */
export const serverRoutes: ServerRoute[] = [
  // The redirect from "/" depends on the language saved in the visitor's browser, so it happens there.
  { path: '', renderMode: RenderMode.Client },
  ...PAGE_PATHS.map(
    (page): ServerRoute => ({
      path: page ? `:lang/${page}` : ':lang',
      renderMode: RenderMode.Prerender,
      getPrerenderParams: everyLanguage,
    }),
  ),
  {
    path: ':lang/news/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      LANGUAGES.flatMap((lang) => NEWS.map((item) => ({ lang, slug: item.slug }))),
  },
  { path: '**', renderMode: RenderMode.Server },
];
