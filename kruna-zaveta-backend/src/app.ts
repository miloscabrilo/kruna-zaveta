import cors from 'cors';
import express, { ErrorRequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { verifyCaptcha } from './captcha.js';
import { createCmsAuthRouter } from './cms-auth.js';
import { Config } from './config.js';
import { Mailer } from './mailer.js';
import { validateContact } from './validation.js';

export function createApp(config: Config, mailer: Mailer, fetchFn: typeof fetch = fetch) {
  const app = express();

  app.set('trust proxy', config.trustProxy);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins, methods: ['POST'] }));
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Short-term limit on every attempt, so bots cannot hammer the form (or the captcha check).
  const burstLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { ok: false, error: 'tooManyRequests' },
  });

  // Daily limit per IP address. Only messages that were accepted count: a typo or a failed captcha
  // (any 4xx/5xx response) does not use up the visitor's quota.
  const dailyLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: config.dailyMessageLimit,
    skipFailedRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { ok: false, error: 'dailyLimit' },
  });

  app.post('/api/contact', burstLimiter, dailyLimiter, async (req, res) => {
    const result = validateContact(req.body);
    if (!result.ok) {
      res.status(400).json({ ok: false, error: 'validation', fields: result.errors });
      return;
    }

    const captchaOk = await verifyCaptcha(config.turnstileSecret, req.body?.captchaToken, req.ip, fetchFn);
    if (!captchaOk) {
      res.status(400).json({ ok: false, error: 'captcha' });
      return;
    }

    // Pretend success for bots so they don't learn to avoid the honeypot.
    if (!result.isSpam) {
      await mailer.sendContactMessage(result.value);
    }
    res.json({ ok: true });
  });

  if (config.cmsAuth) {
    app.use('/api', createCmsAuthRouter(config.cmsAuth, fetchFn));
  }

  app.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'notFound' });
  });

  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    const status = typeof error?.status === 'number' && error.status < 500 ? error.status : 500;
    if (status === 500) {
      // Log only the error, never the request body: it contains the sender's personal data.
      console.error('[api] Unexpected error:', error instanceof Error ? error.message : error);
    }
    res.status(status).json({ ok: false, error: status === 500 ? 'internal' : 'badRequest' });
  };
  app.use(errorHandler);

  return app;
}
