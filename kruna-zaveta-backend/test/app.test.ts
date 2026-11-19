import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { Config } from '../src/config.js';
import { Mailer } from '../src/mailer.js';
import { ContactMessage } from '../src/validation.js';

const config: Config = {
  port: 0,
  corsOrigins: ['http://localhost:4200'],
  trustProxy: 0,
  mailFrom: 'Kruna Zaveta <no-reply@example.org>',
  contactRecipient: 'info@example.org',
  sendConfirmation: false,
  turnstileSecret: 'turnstile-secret',
  dailyMessageLimit: 3,
};

const valid = {
  name: 'Test Person',
  email: 'test@example.org',
  subject: '',
  message: 'Hello',
  language: 'sr',
  captchaToken: 'good-token',
};

/** Fake Cloudflare siteverify: only "good-token" passes. */
function fakeTurnstile() {
  const calls: URLSearchParams[] = [];
  const fetchFn = (async (_url: string, init: RequestInit) => {
    const body = init.body as URLSearchParams;
    calls.push(body);
    return new Response(JSON.stringify({ success: body.get('response') === 'good-token' }));
  }) as unknown as typeof fetch;
  return { fetchFn, calls };
}

describe('POST /api/contact', () => {
  let sent: ContactMessage[];
  let failing: boolean;
  const mailer: Mailer = {
    async sendContactMessage(message) {
      if (failing) throw new Error('SMTP down');
      sent.push(message);
    },
  };
  const app = () => createApp(config, mailer, fakeTurnstile().fetchFn);

  beforeEach(() => {
    sent = [];
    failing = false;
  });

  it('sends a valid message', async () => {
    const turnstile = fakeTurnstile();
    const res = await request(createApp(config, mailer, turnstile.fetchFn)).post('/api/contact').send(valid);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { ok: true });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].email, 'test@example.org');
    assert.equal(turnstile.calls[0].get('secret'), 'turnstile-secret');
  });

  it('returns field errors for invalid input', async () => {
    const res = await request(app()).post('/api/contact').send({ name: '' });
    assert.equal(res.status, 400);
    assert.equal(res.body.fields.name, 'required');
    assert.equal(sent.length, 0);
  });

  it('rejects a missing or invalid captcha', async () => {
    const missing = await request(app()).post('/api/contact').send({ ...valid, captchaToken: undefined });
    const wrong = await request(app()).post('/api/contact').send({ ...valid, captchaToken: 'bot' });
    assert.equal(missing.status, 400);
    assert.equal(missing.body.error, 'captcha');
    assert.equal(wrong.body.error, 'captcha');
    assert.equal(sent.length, 0);
  });

  it('fails closed when Cloudflare cannot be reached', async () => {
    const offline = (async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;
    const res = await request(createApp(config, mailer, offline)).post('/api/contact').send(valid);
    assert.equal(res.body.error, 'captcha');
    assert.equal(sent.length, 0);
  });

  it('silently drops honeypot submissions', async () => {
    const res = await request(app()).post('/api/contact').send({ ...valid, website: 'spam' });
    assert.equal(res.status, 200);
    assert.equal(sent.length, 0);
  });

  it('returns 500 when the email cannot be sent', async () => {
    failing = true;
    const res = await request(app()).post('/api/contact').send(valid);
    assert.equal(res.status, 500);
    assert.equal(res.body.error, 'internal');
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await request(app())
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{"name":');
    assert.equal(res.status, 400);
  });

  it('allows 3 messages per day from one IP address', async () => {
    const server = app();
    for (let i = 0; i < 3; i++) {
      await request(server).post('/api/contact').send(valid).expect(200);
    }
    const res = await request(server).post('/api/contact').send(valid);
    assert.equal(res.status, 429);
    assert.equal(res.body.error, 'dailyLimit');
    assert.equal(sent.length, 3);
  });

  it('does not count failed attempts towards the daily limit', async () => {
    const server = app();
    await request(server).post('/api/contact').send({ ...valid, email: 'typo' }).expect(400);
    await request(server).post('/api/contact').send({ ...valid, captchaToken: 'bot' }).expect(400);
    for (let i = 0; i < 3; i++) {
      await request(server).post('/api/contact').send(valid).expect(200);
    }
    assert.equal(sent.length, 3);
  });

  it('limits rapid attempts even when they all fail', async () => {
    const server = app();
    for (let i = 0; i < 10; i++) {
      await request(server).post('/api/contact').send({ ...valid, captchaToken: 'bot' }).expect(400);
    }
    const res = await request(server).post('/api/contact').send(valid);
    assert.equal(res.status, 429);
    assert.equal(res.body.error, 'tooManyRequests');
  });

  it('allows the configured origin via CORS', async () => {
    const res = await request(app())
      .options('/api/contact')
      .set('Origin', 'http://localhost:4200')
      .set('Access-Control-Request-Method', 'POST');
    assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:4200');
  });
});
