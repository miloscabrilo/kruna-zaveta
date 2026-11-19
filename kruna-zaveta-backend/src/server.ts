import { existsSync } from 'node:fs';
import { createApp } from './app.js';
import { TEST_SECRETS } from './captcha.js';
import { loadConfig } from './config.js';
import { createMailer } from './mailer.js';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const config = loadConfig();
if (TEST_SECRETS.has(config.turnstileSecret)) {
  console.warn('[captcha] TURNSTILE_SECRET_KEY is a Cloudflare TEST key – the captcha accepts everything. Use the real key in production.');
}
const app = createApp(config, createMailer(config));

app.listen(config.port, (error) => {
  if (error) {
    throw error;
  }
  const mode = config.smtp ? `SMTP ${config.smtp.host}:${config.smtp.port}` : 'dev mode (emails logged, not sent)';
  console.log(`Kruna Zaveta API listening on http://localhost:${config.port} – ${mode}`);
});
