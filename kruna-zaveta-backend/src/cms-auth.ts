import { randomBytes, timingSafeEqual } from 'node:crypto';
import { Request, Response, Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { CmsAuthConfig } from './config.js';

/**
 * GitHub login for the news editor (Decap CMS at /admin).
 *
 * Decap opens a popup on GET /api/auth, we send the editor to GitHub, GitHub returns to
 * GET /api/callback with a code, we exchange it for a token and hand the token to the CMS window
 * via postMessage (Decap's OAuth handshake). The token stays in the editor's browser – nothing is stored here.
 *
 * Only GitHub accounts with a verified email on the admin list (ADMIN_EMAILS) get a token; for anyone else
 * the token is revoked immediately and the editor shows "not authorized".
 */

const STATE_COOKIE = 'cms_oauth_state';
const ALLOWED_SCOPES = new Set(['repo', 'public_repo']);

type FetchFn = typeof fetch;

const GITHUB_API_HEADERS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'kruna-zaveta-backend',
  'X-GitHub-Api-Version': '2022-11-28',
};

/** Whether one of the account's verified email addresses is on the admin list. */
async function isAdmin(token: string, adminEmails: Set<string>, fetchFn: FetchFn): Promise<boolean> {
  const response = await fetchFn('https://api.github.com/user/emails', {
    headers: { ...GITHUB_API_HEADERS, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    console.error('[cms-auth] Could not read GitHub emails:', response.status);
    return false;
  }
  const emails = (await response.json()) as { email: string; verified: boolean }[];
  return emails.some((entry) => entry.verified && adminEmails.has(entry.email.trim().toLowerCase()));
}

/** Invalidates a token we will not hand out (best effort). */
async function revokeToken(token: string, config: CmsAuthConfig, fetchFn: FetchFn): Promise<void> {
  const credentials = Buffer.from(`${config.githubClientId}:${config.githubClientSecret}`).toString('base64');
  try {
    await fetchFn(`https://api.github.com/applications/${config.githubClientId}/token`, {
      method: 'DELETE',
      headers: { ...GITHUB_API_HEADERS, Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: token }),
    });
  } catch (error) {
    console.error('[cms-auth] Could not revoke token:', (error as Error).message);
  }
}

function readCookie(req: Request, name: string): string | undefined {
  for (const part of req.headers.cookie?.split(';') ?? []) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return undefined;
}

function sameString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** The popup page that passes the result to the CMS window – only to our own site's origin. */
function sendHandshake(res: Response, siteOrigin: string, message: string): void {
  const nonce = randomBytes(16).toString('base64');
  // JSON-encode and escape "<" so the values cannot break out of the <script> element.
  const data = JSON.stringify({ origin: siteOrigin, message }).replace(/</g, '\\u003c');

  res
    .status(200)
    .set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'`,
      // The popup must keep its link to the CMS window (helmet's default "same-origin" would cut it).
      'Cross-Origin-Opener-Policy': 'unsafe-none',
    })
    .send(`<!doctype html><meta charset="utf-8"><title>Login</title>
<script nonce="${nonce}">
  (function () {
    var data = ${data};
    if (!window.opener) { document.body.textContent = 'Please open the editor again.'; return; }
    window.addEventListener('message', function receive(event) {
      if (event.origin !== data.origin) return;
      window.removeEventListener('message', receive);
      window.opener.postMessage(data.message, data.origin);
    });
    window.opener.postMessage('authorizing:github', data.origin);
  })();
</script>`);
}

export function createCmsAuthRouter(config: CmsAuthConfig, fetchFn: FetchFn = fetch): Router {
  const router = Router();
  router.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }));

  router.get('/auth', (req, res) => {
    const requested = String(req.query['scope'] ?? 'repo');
    // user:email lets us check the account's verified email addresses against the admin list.
    const scope = `${ALLOWED_SCOPES.has(requested) ? requested : 'repo'} user:email`;
    const state = randomBytes(24).toString('hex');

    res.cookie(STATE_COOKIE, state, {
      httpOnly: true,
      secure: req.secure,
      sameSite: 'lax',
      path: '/api',
      maxAge: 10 * 60 * 1000,
    });

    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', config.githubClientId);
    url.searchParams.set('scope', scope);
    url.searchParams.set('state', state);
    res.redirect(url.toString());
  });

  router.get('/callback', async (req, res) => {
    const fail = (message: string) =>
      sendHandshake(res, config.siteOrigin, `authorization:github:error:${JSON.stringify({ message })}`);

    const code = typeof req.query['code'] === 'string' ? req.query['code'] : '';
    const state = typeof req.query['state'] === 'string' ? req.query['state'] : '';
    const expectedState = readCookie(req, STATE_COOKIE);
    res.clearCookie(STATE_COOKIE, { path: '/api' });

    if (!code || !expectedState || !sameString(state, expectedState)) {
      fail('Login expired or was not started from the editor. Please try again.');
      return;
    }

    try {
      const response = await fetchFn('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: config.githubClientId,
          client_secret: config.githubClientSecret,
          code,
        }),
      });
      const body = (await response.json()) as { access_token?: string; error?: string };
      if (!response.ok || !body.access_token) {
        console.error('[cms-auth] GitHub token exchange failed:', body.error ?? response.status);
        fail('GitHub login failed. Please try again.');
        return;
      }

      if (!(await isAdmin(body.access_token, config.adminEmails, fetchFn))) {
        // No email address in the log: rejected visitors' personal data does not belong there.
        console.warn('[cms-auth] Login rejected: no verified email on the admin list');
        await revokeToken(body.access_token, config, fetchFn);
        fail('This GitHub account is not authorized to edit the site. Ask an administrator to add your email address.');
        return;
      }

      sendHandshake(
        res,
        config.siteOrigin,
        `authorization:github:success:${JSON.stringify({ token: body.access_token, provider: 'github' })}`,
      );
    } catch (error) {
      console.error('[cms-auth] Could not reach GitHub:', (error as Error).message);
      fail('Could not reach GitHub. Please try again.');
    }
  });

  return router;
}
