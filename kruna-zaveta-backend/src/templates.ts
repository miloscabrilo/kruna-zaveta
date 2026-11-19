import { ContactMessage, Lang } from './validation.js';

export interface EmailContent {
  subject: string;
  text: string;
  html: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function paragraphs(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br>');
}

/** Email delivered to the organization's inbox. Reply-To is set to the sender by the mailer. */
export function notificationEmail(message: ContactMessage): EmailContent {
  const subject = `[Контакт] ${message.subject || `Порука од ${message.name}`}`;
  const rows: [string, string][] = [
    ['Име / Name', message.name],
    ['Имејл / Email', message.email],
    ['Тема / Subject', message.subject || '–'],
    ['Језик / Language', message.language.toUpperCase()],
  ];

  return {
    subject,
    text: `${rows.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\n${message.message}\n`,
    html: `
      <table cellpadding="4" style="font-family:Arial,sans-serif;font-size:14px">
        ${rows
          .map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${escapeHtml(value)}</td></tr>`)
          .join('')}
      </table>
      <hr>
      <p style="font-family:Arial,sans-serif;font-size:14px">${paragraphs(message.message)}</p>
    `,
  };
}

const CONFIRMATION: Record<Lang, { subject: string; greeting: (name: string) => string; body: string; signature: string }> = {
  sr: {
    subject: 'Примили смо вашу поруку – Круна Завета',
    greeting: (name) => `Поштовани/а ${name},`,
    body: 'хвала вам што сте нам се јавили. Примили смо вашу поруку и одговорићемо вам у најкраћем могућем року.',
    signature: 'Срдачан поздрав,\nКруна Завета',
  },
  en: {
    subject: 'We received your message – Kruna Zaveta',
    greeting: (name) => `Dear ${name},`,
    body: 'thank you for getting in touch. We have received your message and will reply as soon as possible.',
    signature: 'Kind regards,\nKruna Zaveta',
  },
  de: {
    subject: 'Wir haben Ihre Nachricht erhalten – Kruna Zaveta',
    greeting: (name) => `Guten Tag ${name}`,
    body: 'Vielen Dank für Ihre Nachricht. Wir haben sie erhalten und melden uns so bald wie möglich.',
    signature: 'Freundliche Grüße\nKruna Zaveta',
  },
};

/** Optional automatic reply to the sender, in the language they used on the website. */
export function confirmationEmail(message: ContactMessage): EmailContent {
  const t = CONFIRMATION[message.language];
  const text = `${t.greeting(message.name)}\n\n${t.body}\n\n${t.signature}\n`;
  return {
    subject: t.subject,
    text,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px">${paragraphs(text)}</div>`,
  };
}
