# Kruna Zaveta – website + backend

Website of a humanitarian organization helping families in Kosovo and Metohija. Live domain: **krunazaveta.com**.
Repo: `github.com/miloscabrilo/kruna-zaveta`. Human-facing docs (setup, deployment, go-live checklist): `README.md`.

| Folder | Stack |
|---|---|
| `kruna-zaveta-frontend/` | Angular 20.3, SSR + prerendering, zoneless, standalone components, signals |
| `kruna-zaveta-backend/` | Node ≥22, Express 5, TypeScript (ESM, `.js` import suffixes), Nodemailer |

Skills for recurring work: `add-page` (new page in all languages), `edit-content` (texts, news, donors, Serbian Cyrillic), `verify-changes` (build, test, screenshots).

## Commands

```bash
# frontend (kruna-zaveta-frontend/)
npm start            # ng serve :4200 (runs `npm run news` first) – port 4200 is often already used by the user's own ng serve
npm run build        # news → ng build; expect "Prerendered 27 static routes" (6 pages + 3 news, × 3 languages)
npm test -- --watch=false --browsers=ChromeHeadless   # needs CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
npm run cms          # local Decap server (edits content/news on disk), then open /admin/index.html
PORT=4321 node dist/kruna-zaveta-frontend/server/server.mjs   # serve the production build

# backend (kruna-zaveta-backend/)
npm run dev | npm test | npm run typecheck | npm run build
# run without .env: PORT=3000 MAIL_FROM="KZ <no-reply@example.org>" CONTACT_RECIPIENT=info@example.org TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA node dist/server.js
```

Always finish a change with build + tests of the touched project (and a screenshot for visual changes – see `verify-changes`).

## Frontend architecture

- **URLs:** every page lives under `/:lang` (`sr` default, `en`, `de`) – `app.routes.ts`. `langGuard` activates the language; unknown languages redirect to `/sr`. `/` is `RenderMode.Client` and redirects to the language saved in localStorage (`kruna-zaveta.lang`, written only by the header's language switcher). `/:lang/who-we-are` redirects to `about`.
- **Prerendering:** `app.routes.server.ts` builds the server routes from `PAGE_PATHS` (in `app.routes.ts`) × `LANGUAGES`, plus `:lang/news/:slug` per article. `**` → `RenderMode.Server`; `NotFound` sets HTTP 404 via `RESPONSE_INIT`.
- **i18n (runtime, not Angular i18n):** `core/i18n/`. `en.ts` is the reference dictionary and defines the `Translations` type – `sr.ts` / `de.ts` must have exactly the same keys (compiler enforces). Templates: `{{ 'nav.home' | t }}`, content objects: `{{ item.title | localized }}` (both pipes impure on purpose: they read the language signal). In code: `i18n.t(key)`, `i18n.pick(localized)`. Content that differs per language uses `Localized<T> = Record<Lang, T>`.
- **Language rules:** Serbian is **Cyrillic** (`sr-Cyrl-RS`), German uses **Germany** spelling (ß, not ss; `de-DE`), English `en-GB`. Brand name: «Круна Завета» in Serbian, «Kruna Zaveta» in EN/DE. Names of people (team, donors) are `Localized` – Cyrillic in `sr`, Latin in `en`/`de`.
- **Page titles:** each page sets its title in a constructor `effect(() => this.i18n.setPageTitle(this.i18n.t('…title')))`.
- **SEO:** `core/seo.ts` keeps `<link rel=canonical>` and hreflang alternates (incl. `x-default` → sr) in sync, using `SITE.url`.
- **Content (no database):** `core/content/` – `recognitions.ts` (awards received, newest first, optional scan image under `public/images/recognitions/`), `site.ts` (email, socials incl. Viber, payment details, location), `projects.ts`, `team.ts`, `donors.ts` (`FEATURED_DONORS` with tribute text, also on home; `OTHER_DONORS` names only – never publish amounts, only with consent).
- **News:** one YAML file per article in `content/news/*.yml` (`sr`/`en`/`de` sections – Decap i18n `single_file`). `scripts/build-news.mjs` validates (slug `^[a-z0-9-]+$`, date, topic, Serbian title/summary/body required; missing EN/DE fall back to Serbian with a warning), converts Markdown → HTML and writes `core/content/news.generated.ts` (**gitignored, never edit**). Runs via npm pre-hooks – plain `npx ng build` skips it.
- **News editor:** Decap CMS 3.17.3 at `/admin/` (`public/admin/index.html` pins version + SRI hash – update both together; `public/admin/config.yml`). Login goes through the backend (`/api/auth`, `/api/callback`). `src/server.ts` serves `/admin/` and 301-redirects `/admin` → `/admin/`.
- **Donate page:** methods ordered by language (sr: RSD first). EUR shows a GiroCode (EPC QR, `core/girocode.ts` + `shared/qr-code.ts`, rendered synchronously so it's in the prerendered HTML). PayPal card hides when `paypalUrl` is empty.
- **Contact form:** reactive form + honeypot field `website` + Cloudflare Turnstile (`shared/turnstile.ts`, site key in `environments/`). `CONTACT_LIMITS` in `pages/contact/contact.ts` must match `LIMITS` in backend `validation.ts`. Handles backend errors `captcha` and `dailyLimit`.
- **Environments:** `environment.ts` (apiUrl `/api`, behind reverse proxy) vs `environment.development.ts` (`http://localhost:3000/api`), swapped by `fileReplacements`.

## Frontend conventions

- Components: standalone, `ChangeDetectionStrategy.OnPush`, `inject()`, `input()/output()/signal()/computed()`, `@if/@for/@switch`. Small pages keep inline template + styles (`projects`, `not-found`); larger ones use `.html` + `.scss` files.
- Reuse global building blocks from `src/styles.scss` before writing new CSS: `.container`, `.section`, `.section__header`, `.lead`, `.card`, `.card__body`, `.card-grid`, `.card__image`, `.btn` (`--primary`, `--gold`, `--ghost`, `--small`), `.cta-box`, `.avatar` (`--gold`), `.topic-banner[data-topic]`, `.badge`, `.article__body`.
- Design tokens are CSS variables on `:root` (`--color-primary` burgundy #7a1f2b, `--color-gold` #c9a227, `--page-gutter` 24/40/56px, `--radius`, fonts Lora + Inter). Mobile-first; breakpoints 640/768/1024px; the header switches from hamburger to full nav at **1360px** (6 menu items: German needs ~1335px, measured with the header's own wider box `max-width: 1320px + gutters`; re-measure with the container cap removed when changing menu items or labels). Donate (`.header-donate`) is **always in the header bar, never in the menu**: next to the hamburger on phones/tablets, at the far right (after the language switcher) on desktop; the site name is **never truncated** – when space runs out it wraps between the words (Kruna / Zaveta); below 480px the tagline is hidden, below 350px the Donate button loses its icon – check 320/360/390px after header changes.
- Icons: add a `@case` to `shared/icon.ts` (24×24 stroke paths) and extend `IconName`.
- Accessibility: labels for inputs, `aria-*` on toggles, visible focus, skip link, 16px+ inputs (iOS zoom).
- Component style budget: warning 4 kB, error 8 kB – move shared styles to `styles.scss`.

## Backend architecture

- `config.ts` reads env (template: `.env.example`; real `.env` is gitignored – **never commit secrets**). `server.ts` loads `.env` if present and warns when the Turnstile key is Cloudflare's test key.
- `app.ts` → `createApp(config, mailer, fetchFn = fetch)`; inject `fetchFn` to fake Cloudflare/GitHub in tests.
- `POST /api/contact`: burst limit (10 / 15 min, all attempts) → daily limit (`DAILY_MESSAGE_LIMIT`, default 3, `skipFailedRequests` so only accepted messages count) → `validateContact` (400 + fields) → `verifyCaptcha` (Turnstile siteverify, **fails closed**) → honeypot (fake success) → mailer. Rate-limit counters are in memory (per process, reset on restart).
- `mailer.ts`: notification to `CONTACT_RECIPIENT` with Reply-To sender; optional confirmation (`SEND_CONFIRMATION`, off by default). No `SMTP_HOST` → emails are logged (dev mode). `templates.ts` escapes all user input.
- `cms-auth.ts`: GitHub OAuth for Decap. State cookie (CSRF), scope `repo user:email`, token handed to the CMS window only via postMessage to `CMS_SITE_ORIGIN` (nonce CSP, COOP `unsafe-none`). Only accounts with a **verified** email in `ADMIN_EMAILS` get the token; others are refused and the token is revoked. Enabled only when `GITHUB_CLIENT_ID` is set; then `GITHUB_CLIENT_SECRET`, `CMS_SITE_ORIGIN`, `ADMIN_EMAILS` are required.
- Privacy: never log request bodies, email addresses or tokens.
- Tests: `node:test` + `supertest` in `test/*.test.ts`. Add a test for every new route or rule.

## Known pitfalls (learned the hard way)

- **NG0401** on build → `main.server.ts` must pass `BootstrapContext` to `bootstrapApplication`.
- **SSR host allowlist:** hosts not in `angular.json → security.allowedHosts` (krunazaveta.com, www, localhost) or `NG_ALLOWED_HOSTS` silently fall back to client rendering (404 status codes stop working).
- `position: sticky` must be on the component **host**, not an inner element (host is only as tall as its content).
- Component styles don't reach `[innerHTML]` content → style Markdown output globally (`.article__body`).
- Sass: no declarations after nested rules in one block (deprecation) – put `@media` overrides of `:root` in separate blocks.
- Decap: invalid config keys break the whole CMS (e.g. `media_library.config.max_file_size` does not exist for the default library). Decap writes YAML with folded scalars – the build script handles it.
- Turnstile test keys: site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA` (always pass). Real keys for krunazaveta.com are still a go-live TODO.
- `qrcode` is CommonJS → listed in `allowedCommonJsDependencies`.
- Headless Chrome screenshots have a ~500px minimum width → test phone layouts via puppeteer viewport or a 390px iframe (see `verify-changes`).

## Status / open items

Placeholders (marked `PLACEHOLDER` / `SAMPLE CONTENT` in code) and the go-live checklist are in `README.md` → "Before going live". Real so far: domain, Instagram (`instagram.com/kruna.zaveta`). Open: payment details, Facebook/YouTube/Viber links, real news/team/donors, Turnstile + GitHub OAuth keys, `ADMIN_EMAILS`, deployment target (publishing news needs rebuild + deploy on push to `main`), privacy notice review (Cloudflare Turnstile), real logo.
