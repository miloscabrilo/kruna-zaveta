---
name: verify-changes
description: Build, test and visually check the Kruna Zaveta frontend and backend after a change – production build, unit tests, running the SSR server and API locally, phone/desktop screenshots, browser end-to-end checks (contact form, language switch, CMS). Use before reporting any change to the site or API as done.
---

# Verify changes – Kruna Zaveta

Use the session's scratchpad directory for screenshots and scripts, not the repo.

## 1. Build and unit tests

```bash
cd kruna-zaveta-frontend
npm run build 2>&1 | grep -E "\[news\]|Prerendered|WARN|ERROR" -A3
#   expect: "Prerendered 27 static routes" (+3 per new page, +3 per news article); no WARN/ERROR
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  npm test -- --watch=false --browsers=ChromeHeadless 2>&1 | grep -E "TOTAL|FAILED"

cd ../kruna-zaveta-backend
npm test 2>&1 | grep -E "^# (tests|pass|fail)|not ok"; npx tsc --noEmit && npm run build
```
Report failures with their output – never claim success without running these.

## 2. Run locally

```bash
# production build of the site (SSR + prerendered pages)
(PORT=4321 node kruna-zaveta-frontend/dist/kruna-zaveta-frontend/server/server.mjs > /tmp/fe.log 2>&1 &)
# API with throwaway settings (emails are logged, Turnstile test key always passes)
(cd kruna-zaveta-backend && PORT=3000 MAIL_FROM="KZ <no-reply@example.org>" CONTACT_RECIPIENT=info@example.org \
  TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA node dist/server.js > /tmp/be.log 2>&1 &)
```
- Wait in a loop for `curl -s -o /dev/null localhost:4321/sr` instead of sleeping blindly.
- The production build calls `/api` on its own origin (no proxy locally) → test the contact form against `ng serve` (dev environment points to `localhost:3000`). **Port 4200 is often the user's own `ng serve`** – check `lsof -nP -iTCP:4200 -sTCP:LISTEN`; use it if it's there, never kill it, otherwise start one with `--port 4300`.
- Restart the backend between rate-limit tests (counters are in memory; daily limit 3 per IP).
- Useful status checks: `/xx` → 302 to `/sr`; `/sr/unknown` → 404; `/admin` → 301 `/admin/`; `/en/who-we-are` → 302 `/en/about`.
- Stop what you started at the end: `pkill -f "server/server.mjs"; pkill -f "node dist/server.js"`.

## 3. Screenshots (always for visual changes)

Headless Chrome enforces a ~500px minimum window, so a `--window-size=390,…` screenshot is **not** a phone layout. Use either:

- **iframe trick** (quick, no dependencies):
  ```html
  <!doctype html><body style="margin:0;display:flex;gap:10px;background:#888">
  <iframe src="http://localhost:4321/sr" style="width:390px;height:1400px;border:0"></iframe>
  <iframe src="http://localhost:4321/de/donate" style="width:390px;height:1400px;border:0"></iframe>
  </body>
  ```
  `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=800,1400 --virtual-time-budget=6000 --screenshot=<scratch>/shot.png file://<scratch>/phone.html`
- **puppeteer-core** (for clicks, scrolling, forms): `npm i puppeteer-core@24` in the scratchpad, launch with `executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'` and `page.setViewport({ width: 390, height: 760, isMobile: true })`. At widths < 1200px the nav is behind `.menu-toggle`.

Then look at the PNGs (Read tool). Check at least: SR (Cyrillic) and DE (long words), phone 390px and desktop 1280px, no horizontal overflow, header stays on top when scrolled.

## 4. End-to-end recipes (puppeteer)

- **Contact form:** fill `#name`, `#email`, `#message`; wait for `app-turnstile input[name="cf-turnstile-response"]` to have a value; click `button[type=submit]` together with `page.waitForResponse(r => r.url().endsWith('/api/contact'))` (reading the alert right after clicking can return the previous message). 3 sends → 200, 4th → 429 `dailyLimit`.
- **Language memory:** click `a.lang-switch__link[hreflang="de"]` → `localStorage['kruna-zaveta.lang'] === 'de'` → opening `/` lands on `/de`.
- **CMS:** `npm run cms` (decap-server on :8081, run from the repo root), open `/admin/`, click the element with text "Login", entries link to `#/collections/news/entries/<file>`. Publishing writes the YAML file on disk – copy it first and restore it afterwards.

## 5. Before reporting

State what was run and the results (route count, test totals, screenshots checked), anything that could not be verified (e.g. real GitHub login, real Cloudflare keys, SMTP), and leftover placeholders. Update `README.md` / `CLAUDE.md` when setup or architecture changed.
