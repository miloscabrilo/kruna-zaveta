import nodemailer, { Transporter } from 'nodemailer';
import { Config } from './config.js';
import { confirmationEmail, notificationEmail } from './templates.js';
import { ContactMessage } from './validation.js';

export interface Mailer {
  sendContactMessage(message: ContactMessage): Promise<void>;
}

function createTransport(config: Config): Transporter {
  if (!config.smtp) {
    // Development: render the email as JSON instead of sending it.
    return nodemailer.createTransport({ jsonTransport: true });
  }
  const { host, port, secure, user, password } = config.smtp;
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass: password } : undefined,
  });
}

export function createMailer(config: Config, transport: Transporter = createTransport(config)): Mailer {
  const isDevTransport = !config.smtp;

  return {
    async sendContactMessage(message) {
      const notification = notificationEmail(message);
      const info = await transport.sendMail({
        from: config.mailFrom,
        to: config.contactRecipient,
        replyTo: { name: message.name, address: message.email },
        ...notification,
      });
      if (isDevTransport) {
        console.info('[mailer] SMTP not configured – email not sent:\n', info.message?.toString());
      }

      if (config.sendConfirmation) {
        // The notification already reached the organization, so a failed auto-reply is only logged.
        try {
          await transport.sendMail({
            from: config.mailFrom,
            to: { name: message.name, address: message.email },
            ...confirmationEmail(message),
          });
        } catch (error) {
          console.error('[mailer] Could not send confirmation email:', (error as Error).message);
        }
      }
    },
  };
}
