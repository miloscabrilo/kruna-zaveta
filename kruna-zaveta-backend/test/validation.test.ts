import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { escapeHtml, notificationEmail } from '../src/templates.js';
import { validateContact } from '../src/validation.js';

const valid = { name: 'Test Person', email: 'test@example.org', subject: 'Hi', message: 'Hello', language: 'de' };

describe('validateContact', () => {
  it('accepts a valid message', () => {
    const result = validateContact(valid);
    assert.equal(result.ok, true);
    assert.ok(result.ok && !result.isSpam && result.value.language === 'de');
  });

  it('reports missing and invalid fields', () => {
    const result = validateContact({ email: 'not-an-email' });
    assert.deepEqual(result, {
      ok: false,
      errors: { name: 'required', email: 'invalid', message: 'required' },
    });
  });

  it('rejects overly long messages', () => {
    const result = validateContact({ ...valid, message: 'x'.repeat(5001) });
    assert.equal(result.ok, false);
  });

  it('strips line breaks from single-line fields', () => {
    const result = validateContact({ ...valid, subject: 'Hi\r\nBcc: someone@example.org' });
    assert.ok(result.ok && !result.value.subject.includes('\n'));
  });

  it('falls back to Serbian for unknown languages', () => {
    const result = validateContact({ ...valid, language: 'fr' });
    assert.ok(result.ok && result.value.language === 'sr');
  });

  it('flags the honeypot as spam', () => {
    const result = validateContact({ ...valid, website: 'http://spam.example' });
    assert.ok(result.ok && result.isSpam);
  });

  it('handles non-object bodies', () => {
    assert.equal(validateContact(null).ok, false);
    assert.equal(validateContact('text').ok, false);
  });
});

describe('templates', () => {
  it('escapes user input in HTML emails', () => {
    assert.equal(escapeHtml('<b>"x" & \'y\'</b>'), '&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;');
    const email = notificationEmail({ ...valid, message: '<script>alert(1)</script>', language: 'en' });
    assert.ok(!email.html.includes('<script>'));
  });
});

describe('confirmation email', () => {
  it('is written in Serbian Cyrillic for Serbian senders', async () => {
    const { confirmationEmail } = await import('../src/templates.js');
    const email = confirmationEmail({ ...valid, language: 'sr' });
    assert.match(email.subject, /Круна Завета/);
    assert.match(email.text, /Поштовани\/а Test Person/);
  });
});
