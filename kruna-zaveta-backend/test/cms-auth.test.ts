import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Config } from '../src/config.js';
import { Mailer } from '../src/mailer.js';

const config: Config = {
  port: 0,
  corsOrigins: ['http://localhost:4200'],
  trustProxy: 0,
  mailFrom: 'no-reply@example.org',
  contactRecipient: 'info@example.org',
  sendConfirmation: false,
  turnstileSecret: 'secret',
  dailyMessageLimit: 3,
  cmsAuth: {
    githubClientId: 'client-id',
    githubClientSecret: 'client-secret',
    siteOrigin: 'https://krunazaveta.com',
    adminEmails: new Set(['editor@krunazaveta.com']),
  },
};
const mailer: Mailer = { async sendContactMessage() {} };

type GitHubEmail = { email: string; verified: boolean };

/** Fake GitHub: token exchange, the account's email list and token revocation. */
function fakeGitHub(tokenResponse: object, emails: GitHubEmail[] = [{ email: 'Editor@KrunaZaveta.com', verified: true }]) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchFn = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    if (url.endsWith('/login/oauth/access_token')) return new Response(JSON.stringify(tokenResponse));
    if (url.endsWith('/user/emails')) return new Response(JSON.stringify(emails));
    if (url.includes('/applications/')) return new Response(null, { status: 204 });
    throw new Error(`unexpected ${url}`);
  }) as unknown as typeof fetch;
  const revoked = () => calls.some((c) => c.url.includes('/applications/client-id/token') && c.init.method === 'DELETE');
  return { fetchFn, calls, revoked };
}

/** Starts the login and returns the state cookie GitHub would send back to us. */
async function startLogin(app: ReturnType<typeof createApp>) {
  const res = await request(app).get('/api/auth?provider=github&scope=repo');
  const location = new URL(res.headers['location']);
  const cookie = ([] as string[]).concat(res.headers['set-cookie'] ?? [])[0].split(';')[0];
  return { res, location, cookie, state: location.searchParams.get('state')! };
}

describe('CMS GitHub login', () => {
  it('redirects to GitHub with client id, scope and state', async () => {
    const { res, location, state } = await startLogin(createApp(config, mailer));
    assert.equal(res.status, 302);
    assert.equal(location.origin + location.pathname, 'https://github.com/login/oauth/authorize');
    assert.equal(location.searchParams.get('client_id'), 'client-id');
    assert.equal(location.searchParams.get('scope'), 'repo user:email');
    assert.ok(state.length >= 32);
  });

  it('ignores unexpected scopes', async () => {
    const res = await request(createApp(config, mailer)).get('/api/auth?scope=admin:org');
    assert.equal(new URL(res.headers['location']).searchParams.get('scope'), 'repo user:email');
  });

  it('exchanges the code and hands the token only to the site origin', async () => {
    const github = fakeGitHub({ access_token: 'gho_token' });
    const app = createApp(config, mailer, github.fetchFn);
    const { cookie, state } = await startLogin(app);

    const res = await request(app).get(`/api/callback?code=abc&state=${state}`).set('Cookie', cookie);
    assert.equal(res.status, 200);
    assert.match(res.text, /authorization:github:success:/);
    assert.match(res.text, /gho_token/);
    assert.match(res.text, /"origin":"https:\/\/krunazaveta.com"/);
    assert.equal(res.headers['cross-origin-opener-policy'], 'unsafe-none');
    assert.match(res.headers['content-security-policy'], /script-src 'nonce-/);
    assert.equal(JSON.parse(github.calls[0].init.body as string).client_secret, 'client-secret');
    assert.equal(github.revoked(), false);
  });

  it('rejects a callback whose state does not match', async () => {
    const github = fakeGitHub({ access_token: 'gho_token' });
    const app = createApp(config, mailer, github.fetchFn);
    const { cookie } = await startLogin(app);

    const res = await request(app).get('/api/callback?code=abc&state=forged').set('Cookie', cookie);
    assert.match(res.text, /authorization:github:error:/);
    assert.doesNotMatch(res.text, /gho_token/);
    assert.equal(github.calls.length, 0);
  });

  for (const [label, emails] of [
    ['an email that is not on the admin list', [{ email: 'someone@example.org', verified: true }]],
    ['an admin email that is not verified', [{ email: 'editor@krunazaveta.com', verified: false }]],
  ] as [string, GitHubEmail[]][]) {
    it(`refuses ${label} and revokes the token`, async () => {
      const github = fakeGitHub({ access_token: 'gho_token' }, emails);
      const app = createApp(config, mailer, github.fetchFn);
      const { cookie, state } = await startLogin(app);

      const res = await request(app).get(`/api/callback?code=abc&state=${state}`).set('Cookie', cookie);
      assert.match(res.text, /authorization:github:error:/);
      assert.match(res.text, /not authorized/);
      assert.doesNotMatch(res.text, /gho_token/);
      assert.equal(github.revoked(), true);
    });
  }

  it('reports a failed token exchange', async () => {
    const app = createApp(config, mailer, fakeGitHub({ error: 'bad_verification_code' }).fetchFn);
    const { cookie, state } = await startLogin(app);
    const res = await request(app).get(`/api/callback?code=abc&state=${state}`).set('Cookie', cookie);
    assert.match(res.text, /authorization:github:error:/);
  });

  it('is disabled when not configured', async () => {
    const res = await request(createApp({ ...config, cmsAuth: undefined }, mailer)).get('/api/auth');
    assert.equal(res.status, 404);
  });
});
