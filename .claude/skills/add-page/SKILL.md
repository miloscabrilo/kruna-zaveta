---
name: add-page
description: Add a new page (or section with its own URL) to the Kruna Zaveta website in all three languages – route, prerendering, translations, navigation, title, SEO. Use when the user asks for a new page, tab or menu item on the site.
---

# Add a page to the Kruna Zaveta website

All paths are relative to `kruna-zaveta-frontend/`. Read `CLAUDE.md` first if it isn't loaded.

## 1. Decide the basics (ask only if unclear)

- **URL path** in English, lowercase with dashes (e.g. `events`). It is the same in all languages: `/sr/events`, `/en/events`, `/de/events`.
- **In the main menu?** The header is full – 6 nav items + languages + Donate need ~1335px in German (desktop menu starts at 1360px; header box max 1320px + gutters). A 7th item means measuring again (remove the `.header__bar` max-width cap when measuring, or the numbers are wrong), raising the breakpoint/box, or shortening labels. Otherwise link it from the footer or from another page.
- **Content source:** fixed texts → translation keys; a list of items (cards) → a typed file in `src/app/core/content/` with `Localized` fields.

## 2. Translations – all three dictionaries

1. Add a section to `src/app/core/i18n/en.ts` (reference – it defines the type), e.g. `events: { title: '…', intro: '…' }`, and `nav.events` if it goes in the menu.
2. Add the same keys to `sr.ts` (**Serbian Cyrillic**) and `de.ts` (**Germany** spelling – ß). The compiler fails if a key is missing.
3. Write Serbian in Cyrillic directly, or write Latin and convert with the `edit-content` skill's `translit.py`. Tell the user that SR/DE texts should be proofread by native speakers.

## 3. Content file (only for lists of items)

```ts
// src/app/core/content/events.ts
import { Localized } from '../i18n/languages';

export interface Event { id: string; date: string; title: Localized; description: Localized; }

// SAMPLE CONTENT – replace with real data.
export const EVENTS: Event[] = [ /* … */ ];
```
Mark invented data with `SAMPLE CONTENT` / `PLACEHOLDER` and add it to the README go-live checklist.

## 4. Component

Create `src/app/pages/<name>/<name>.ts` following existing pages (`projects.ts` = small inline template; `donors/` = separate html/scss):

```ts
@Component({
  selector: 'app-events',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, LocalizedPipe, Icon],
  templateUrl: './events.html',
  styleUrl: './events.scss',
})
export class Events {
  protected readonly i18n = inject(I18n);
  constructor() {
    effect(() => this.i18n.setPageTitle(this.i18n.t('events.title')));
  }
}
```
- Layout: `<section class="section container">` + `<header class="section__header"><h1>…</h1><p class="lead">…</p></header>`; grids with `.card-grid` / `.card` / `.card__body`; calls to action with `.cta-box` or `.btn--primary`.
- Internal links always include the language: `[routerLink]="['/', i18n.lang(), 'donate']"`.
- Reuse global styles from `src/styles.scss`; keep component SCSS under 4 kB.

## 5. Routing + prerendering

1. `src/app/app.routes.ts`: add the path to `PAGE_PATHS` **and** a lazy child route under `:lang`, above the `**` route:
   `{ path: 'events', loadComponent: () => import('./pages/events/events').then((m) => m.Events) },`
2. `app.routes.server.ts` picks up `PAGE_PATHS` automatically. Routes with their own parameter (like `news/:slug`) need an extra entry with `getPrerenderParams`.
3. Renaming a path? Keep the old one as `{ path: 'old', redirectTo: 'new' }` (see `who-we-are`).

## 6. Navigation (optional)

- Menu + footer: add `{ path: 'events', key: 'nav.events', exact: false }` to `src/app/shared/nav-items.ts` (both use it).
- The language switcher, canonical and hreflang links work automatically.

## 7. Verify

Use the `verify-changes` skill: build (route count rises by 3 per page), tests, desktop + 390px phone screenshot in at least SR and DE (Cyrillic and long German words are the usual layout breakers). Update `README.md` → "Website structure" table and `CLAUDE.md` if the architecture changed.
