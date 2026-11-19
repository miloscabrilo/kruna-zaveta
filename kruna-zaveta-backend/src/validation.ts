export const LANGUAGES = ['sr', 'en', 'de'] as const;
export type Lang = (typeof LANGUAGES)[number];

// Keep in sync with the frontend form (kruna-zaveta-frontend/src/app/pages/contact/contact.ts).
export const LIMITS = { name: 100, email: 200, subject: 150, message: 5000 } as const;

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  language: Lang;
}

export type ValidationResult =
  | { ok: true; value: ContactMessage; isSpam: boolean }
  | { ok: false; errors: Record<string, string> };

// Pragmatic check: something@domain.tld, no spaces. Real verification happens when we reply.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Single-line fields must not contain line breaks (prevents header injection in subjects). */
function singleLine(value: unknown): string {
  return text(value).replace(/[\r\n\t]+/g, ' ');
}

export function validateContact(body: unknown): ValidationResult {
  const input = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

  const value: ContactMessage = {
    name: singleLine(input['name']),
    email: singleLine(input['email']),
    subject: singleLine(input['subject']),
    message: text(input['message']),
    language: LANGUAGES.includes(input['language'] as Lang) ? (input['language'] as Lang) : 'sr',
  };

  const errors: Record<string, string> = {};
  if (!value.name) errors['name'] = 'required';
  else if (value.name.length > LIMITS.name) errors['name'] = 'tooLong';

  if (!value.email) errors['email'] = 'required';
  else if (value.email.length > LIMITS.email) errors['email'] = 'tooLong';
  else if (!EMAIL_PATTERN.test(value.email)) errors['email'] = 'invalid';

  if (value.subject.length > LIMITS.subject) errors['subject'] = 'tooLong';

  if (!value.message) errors['message'] = 'required';
  else if (value.message.length > LIMITS.message) errors['message'] = 'tooLong';

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  // Honeypot field: hidden in the form, so only bots fill it in.
  const isSpam = text(input['website']).length > 0;
  return { ok: true, value, isSpam };
}
