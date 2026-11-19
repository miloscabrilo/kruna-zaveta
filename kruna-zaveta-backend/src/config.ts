export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
}

export interface CmsAuthConfig {
  githubClientId: string;
  githubClientSecret: string;
  /** Origin of the website running the CMS (/admin), the only one that receives the login token. */
  siteOrigin: string;
  /** Lower-case email addresses allowed to log in to the CMS. */
  adminEmails: Set<string>;
}

export interface Config {
  port: number;
  corsOrigins: string[];
  trustProxy: number;
  /** Undefined means "development mode": emails are logged instead of sent. */
  smtp?: SmtpConfig;
  mailFrom: string;
  contactRecipient: string;
  sendConfirmation: boolean;
  /** Cloudflare Turnstile secret key for the contact form captcha. */
  turnstileSecret: string;
  /** Messages one IP address may send per day. */
  dailyMessageLimit: number;
  /** Undefined disables the news editor login (/api/auth, /api/callback). */
  cmsAuth?: CmsAuthConfig;
}

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const smtpHost = env['SMTP_HOST']?.trim();
  const githubClientId = env['GITHUB_CLIENT_ID']?.trim();

  return {
    port: Number(env['PORT'] ?? 3000),
    corsOrigins: (env['CORS_ORIGINS'] ?? 'http://localhost:4200')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    trustProxy: Number(env['TRUST_PROXY'] ?? 0),
    smtp: smtpHost
      ? {
          host: smtpHost,
          port: Number(env['SMTP_PORT'] ?? 587),
          secure: env['SMTP_SECURE'] === 'true',
          user: env['SMTP_USER'] || undefined,
          password: env['SMTP_PASSWORD'] || undefined,
        }
      : undefined,
    mailFrom: required(env, 'MAIL_FROM'),
    contactRecipient: required(env, 'CONTACT_RECIPIENT'),
    sendConfirmation: env['SEND_CONFIRMATION'] === 'true',
    turnstileSecret: required(env, 'TURNSTILE_SECRET_KEY'),
    dailyMessageLimit: Number(env['DAILY_MESSAGE_LIMIT'] ?? 3),
    cmsAuth: githubClientId
      ? {
          githubClientId,
          githubClientSecret: required(env, 'GITHUB_CLIENT_SECRET'),
          siteOrigin: new URL(required(env, 'CMS_SITE_ORIGIN')).origin,
          adminEmails: new Set(
            required(env, 'ADMIN_EMAILS')
              .split(',')
              .map((email) => email.trim().toLowerCase())
              .filter(Boolean),
          ),
        }
      : undefined,
  };
}
