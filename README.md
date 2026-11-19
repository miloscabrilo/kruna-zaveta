# kruna-zaveta
Kruna Zaveta is a humanitarian organization dedicated to providing aid to vulnerable families and individuals in Kosovo and Metohija. Through solidarity, humanity, and unity, we strive to offer support to those who need it most and contribute to creating better living conditions.

## Projects

| Folder | What it is |
| --- | --- |
| `kruna-zaveta-frontend/` | Website – Angular 20 with server-side rendering, every page prerendered in Serbian, English and German |
| `kruna-zaveta-backend/` | Small Node/Express API that receives the contact form and sends it by email (Nodemailer / SMTP) |

## Run locally

```bash
# 1. Backend (http://localhost:3000)
cd kruna-zaveta-backend
npm install
cp .env.example .env        # leave SMTP_HOST empty: emails are printed to the console instead of sent
npm run dev

# 2. Frontend (http://localhost:4200) – in a second terminal
cd kruna-zaveta-frontend
npm install
npm start
```

Tests: `npm test` in each folder (frontend needs Chrome installed).

## Website structure

All URLs start with the language: `/sr/…`, `/en/…`, `/de/…` (`/` redirects to `/sr`).
Serbian is written in Cyrillic; names shown in all languages (team, donors) are stored once per language so they can be Cyrillic in Serbian and Latin in English/German.

| Path | Page |
| --- | --- |
| `/sr` | Home – hero and all news |
| `/sr/news/<slug>` | Single news article |
| `/sr/what-we-have-done` | Completed and ongoing projects |
| `/sr/recognitions` | Recognitions – awards, plaques and letters of thanks the organization received |
| `/sr/about` | Mission, vision, values, team, volunteering (`/sr/who-we-are` redirects here) |
| `/sr/donors` | Featured donors with a personal thank-you, plus a list of other donors (also teased on the home page) |
| `/sr/donate` | Euro transfer (SEPA + GiroCode QR), PayPal, dinar account – and other ways to help |
| `/sr/contact` | Contact form, email, social networks |

Social network links are in the footer, on the contact page and on the donate page.

## Editing content

Content lives in TypeScript files – no database needed. After a change, rebuild (`npm run build`).

- **UI texts** (menus, headings, buttons): `kruna-zaveta-frontend/src/app/core/i18n/{sr,en,de}.ts`.
  `en.ts` is the reference; the compiler fails if a key is missing in another language.
- **News**: one file per article in `kruna-zaveta-frontend/content/news/*.yml`, edited in the browser at `/admin` (see below) or by hand. New articles are prerendered automatically.
- **Projects**: `src/app/core/content/projects.ts`
- **Recognitions**: `src/app/core/content/recognitions.ts` (newest first; optional photo/scan in `public/images/recognitions/`)
- **Team**: `src/app/core/content/team.ts`
- **Donors**: `src/app/core/content/donors.ts` – `FEATURED_DONORS` (with a thank-you text, shown first and on the home page) and `OTHER_DONORS` (names only)
- **Email, social links, payment details**: `src/app/core/content/site.ts`

### Donation methods

| Method | Who it is for | Details |
| --- | --- | --- |
| SEPA transfer in EUR | Germany, Austria, euro area | IBAN/BIC plus a **GiroCode** (EPC QR) that most German banking apps scan to pre-fill the transfer |
| PayPal | Online, by account or card | Paste the link of a PayPal "Donate" button (`paypalUrl`); empty hides the card |
| Dinar account | Donors in Serbia | Recipient, 18-digit account number, bank |

Serbian visitors see the dinar account first; English/German visitors see euro first.

### Before going live – replace placeholders

Everything below is sample or placeholder content and is marked `PLACEHOLDER` / `SAMPLE CONTENT` in code:

- [ ] Euro account, dinar account and PayPal link (`site.ts`) – then remove the yellow placeholder notice from the donate page (`donate.placeholderNotice`). Scan the GiroCode with a real banking app once the real IBAN is in.
- [ ] Register the domain `krunazaveta.com` (was unregistered on 2026-11-17) and create the `info@` mailbox
- [ ] Contact email, phone, social network URLs (`site.ts`)
- [ ] Cloudflare Turnstile keys for krunazaveta.com: site key → `kruna-zaveta-frontend/src/environments/environment.ts`, secret key → backend `TURNSTILE_SECRET_KEY` (both are Cloudflare test keys now; the backend warns at startup)
- [ ] Mention Cloudflare Turnstile in the privacy notice – have it checked by someone who knows the data protection rules
- [ ] News articles, projects, recognitions, team members, donors – real content. Team members and donors only with their consent; no donation amounts.
- [ ] Logo (`src/app/shared/logo.ts`) and `public/favicon.ico`
- [ ] Have the Serbian and German texts proofread by native speakers
- [ ] Privacy notice – check with someone who knows the applicable data protection rules

## News editor (`/admin`)

News is edited with [Decap CMS](https://decapcms.org) – a web editor that saves each article as a file in this GitHub repository. No database.

- Open `https://krunazaveta.com/admin/`, log in with GitHub, click **New Article**.
- Serbian is required; English and German can be added later (until then the Serbian text is shown on those pages).
- **URL slug** is the article's address in latin letters (e.g. `winter-firewood-action`). Don't change it after publishing.
- Photos are uploaded to `kruna-zaveta-frontend/public/images/news/`. Resize phone photos first (under ~1 MB).
- The text field supports headings, bold, links, lists and quotes.

**Publishing = a commit to `main`.** The site is prerendered, so the article appears only after the site is **rebuilt and redeployed**. Set up automatic deployment on push to `main` (depends on the hosting).

`npm run build` runs `scripts/build-news.mjs` first, which checks every article. An invalid slug, date or a missing Serbian field **fails the build** with a message naming the file.

### One-time setup

1. **Who can edit – two checks, both required:**
   - the person's GitHub account has *write* access to this repository (GitHub → repository → Settings → Collaborators), and
   - one of its **verified** email addresses is in the backend's `ADMIN_EMAILS` (comma-separated). Anyone else is refused at login and their token is revoked.

   To remove an editor, take them off `ADMIN_EMAILS` **and** remove their collaborator access (an editor who is already logged in keeps working until their GitHub access is removed).
2. **GitHub OAuth App** (GitHub → Settings → Developer settings → OAuth Apps → New):
   Homepage URL `https://krunazaveta.com`, callback URL `https://krunazaveta.com/api/callback`.
3. Put its Client ID and a new Client Secret into the backend's environment: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `CMS_SITE_ORIGIN=https://krunazaveta.com`, `ADMIN_EMAILS=…` (never into git). The backend refuses to start if `ADMIN_EMAILS` is missing.
4. `/api` must reach the backend on the same domain (reverse proxy) – the login runs through it.

### Editing locally (no GitHub login)

```bash
cd kruna-zaveta-frontend
npm run cms      # local Decap server, edits files on your disk – keep it running
npm start        # second terminal
```
Open http://localhost:4200/admin/index.html and click **Login**. Changes are written straight to `content/news/` – review and commit them yourself. Restart `npm start` to see new articles on the site.

## Deployment

**Frontend** – `npm run build`, then run `node dist/kruna-zaveta-frontend/server/server.mjs` (port via `PORT`, default 4000).
Set `NG_ALLOWED_HOSTS` to the public domain (e.g. `NG_ALLOWED_HOSTS=krunazaveta.org,www.krunazaveta.org`), otherwise Angular falls back to client-side rendering.
Since every page is prerendered, `dist/kruna-zaveta-frontend/browser` can also be hosted as static files.

**Backend** – `npm run build && npm start` with the variables from `.env.example` set (real SMTP credentials go only into the server's environment, never into git).
The frontend calls `/api/contact` on its own domain in production (`src/environments/environment.ts`), so either:
- reverse-proxy `/api` to the backend (recommended, no CORS needed), or
- set `apiUrl` to the backend's full URL and add the website's origin to `CORS_ORIGINS`.

If the backend runs behind a reverse proxy, set `TRUST_PROXY=1` so the rate limit (5 messages / 15 min per IP) sees real client IPs.

### Contact form – what the backend does

- Validates input (same limits as the form), strips line breaks from single-line fields
- **Captcha** (Cloudflare Turnstile): every message needs a valid one-time token; if Cloudflare cannot be reached the message is refused (fails closed)
- **3 messages per day per IP address** (`DAILY_MESSAGE_LIMIT`); failed attempts don't count. Plus max. 10 attempts per 15 minutes. Counters live in memory, so they reset when the backend restarts and are per process.
- Hidden honeypot field: bot submissions get a fake success and are dropped
- Sends the message to `CONTACT_RECIPIENT` with Reply-To set to the sender, so you can answer directly
- Optional auto-reply to the sender in their language (`SEND_CONFIRMATION=true`). Off by default, because anyone can type someone else's address into the form
- Never logs the message content in production mode
