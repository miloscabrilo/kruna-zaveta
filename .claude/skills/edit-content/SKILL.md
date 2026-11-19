---
name: edit-content
description: Change texts or data on the Kruna Zaveta website – translations (Serbian Cyrillic / English / German), news articles, projects, team, donors, contact and social links, payment details. Use for any wording, translation or content update, and whenever Serbian text has to be written or converted to Cyrillic.
---

# Edit content on the Kruna Zaveta website

All paths are relative to `kruna-zaveta-frontend/`. Nothing lives in a database: content is TypeScript or YAML in the repo.

## Where things are

| What | File |
|---|---|
| UI texts (menus, headings, buttons, messages) | `src/app/core/i18n/{en,sr,de}.ts` – `en.ts` defines the keys |
| News articles | `content/news/*.yml` (or the editor at `/admin`) |
| Projects ("What we have done") | `src/app/core/content/projects.ts` |
| Team (About page) | `src/app/core/content/team.ts` |
| Donors (Donors page + home strip) | `src/app/core/content/donors.ts` |
| Email, phone, location, social links (incl. Viber group), EUR/RSD accounts, PayPal link, site URL | `src/app/core/content/site.ts` |
| Email texts sent by the backend (notification, auto-reply) | `kruna-zaveta-backend/src/templates.ts` |

## Language rules

- **Serbian = Cyrillic**, always. Brand: «Круна Завета». Serbian quotation marks „…“ (inner ’…’).
- **German = Germany spelling** (ß, "Veranstaltungen" rather than Swiss "Anlässe"), formal "Sie". Quotes „…“ (inner ‚…‘).
- **English** British-leaning, plain.
- Names of people/companies are `Localized`: Cyrillic in `sr`, Latin in `en`/`de` (e.g. `Ана Николић` / `Ana Nikolić`).
- Keep the same keys in all three dictionaries; the compiler enforces it. Run a build after editing.
- Tell the user that SR/DE texts written by Claude should be proofread by a native speaker. Ask the user about the tone they want if it's new copy (they were asked to define their own communication style).

### Converting Serbian Latin → Cyrillic

`translit.py` (next to this file) converts single-quoted string literals in place:
```bash
python3 .claude/skills/edit-content/translit.py sr-keys src/app/core/content/projects.ts  # only `sr:` values
python3 .claude/skills/edit-content/translit.py all path/to/file.ts                         # every literal
```
It keeps IBAN/BIC/SWIFT/SEPA/PayPal/GiroCode/QR, URLs and emails in Latin. Always review `git diff` – words where "nj"/"lj" are two separate letters need a manual fix.

## News articles

One file per article, `content/news/<yyyy-mm-dd>-<slug>.yml`:
```yaml
sr:
  title: Наслов вести
  slug: latin-slug-for-the-url      # ^[a-z0-9]+(-[a-z0-9]+)*$, never change after publishing
  date: 2026-11-17
  topic: food                        # food | heating | education | health | community (banner colour/icon)
  image: /images/news/photo.jpg      # optional, file in public/images/news/ (keep it under ~1 MB)
  summary: Једна или две реченице за листу вести.
  body: |
    Текст у Markdown-у – **подебљано**, [линк](https://…), листе, ## поднаслови.
en:
  title: …                           # en/de may repeat slug/date/topic/image (Decap does); summary/body are translated
  summary: …
  body: |
    …
de:
  …
```
- Missing EN/DE fields fall back to Serbian (build prints a warning). Missing Serbian fields or a bad slug/date **fail the build**.
- `npm run news` regenerates `src/app/core/content/news.generated.ts` – never edit that file.
- Normally editors use `/admin` (Decap CMS); config in `public/admin/config.yml`. Adding a field there also means reading it in `scripts/build-news.mjs`, extending `NewsItem` in `core/content/news.ts`, and showing it in `pages/home` / `pages/news-detail`.

## Donors

- `FEATURED_DONORS`: name + `since` year + `tribute` (what their support made possible) – shown as cards and on the home page.
- `OTHER_DONORS`: names only.
- **Only list donors with their consent; never publish donation amounts.**

## Payment details and links

- Replacing a `PLACEHOLDER` in `site.ts`: also remove the line from the README go-live checklist. When the real payment data is in, remove the `donate.placeholderNotice` paragraph from `pages/donate/donate.html` (and its keys) – ask the user first.
- The GiroCode QR is generated from `payments.eur` automatically – remind the user to scan it with a real banking app once.
- Social links: `id` must exist in `SocialLink['id']` and as an icon in `shared/icon.ts`.
- Do not write legal, tax or regulatory claims (e.g. tax-deductible donations, receipts) – point the user to a tax advisor / legal review.

## After editing

Build + tests (`verify-changes` skill); screenshot if text length changed noticeably (Cyrillic and German get long).
