import nodemailer from 'nodemailer';

/**
 * Email service using SMTP with a log fallback.
 * If SMTP_HOST is not set, messages are logged to console instead of sent.
 */
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private from: string;

  constructor() {
    this.from = process.env.EMAIL_FROM || 'no-reply@example.com';

    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' }
          : undefined,
      });
    }
  }

  // PUBLIC_INTERFACE
  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    /** Sends an email or logs if SMTP not configured. */
    if (!this.transporter) {
      // eslint-disable-next-line no-console
      console.log('[EmailService][LOG-ONLY]', { to, subject, text, html });
      return;
    }
    await this.transporter.sendMail({ from: this.from, to, subject, text, html });
  }
}

export const emailService = new EmailService();
