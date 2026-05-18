import nodemailer from "nodemailer";

type WelcomePasswordMail = {
  email: string;
  name: string;
  password: string;
};

const missingSmtpConfig = () =>
  ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].filter((key) => !process.env[key]);

class MailService {
  private transporter() {
    const missingKeys = missingSmtpConfig();

    if (missingKeys.length) {
      throw new Error(
        `SMTP email is not configured. Missing: ${missingKeys.join(", ")}`,
      );
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendWelcomePassword({ email, name, password }: WelcomePasswordMail) {
    const from = process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@sphere.local";
    const subject = "Your Sphere account password";
    const text = [
      `Hi ${name},`,
      "",
      "Your Sphere account has been created.",
      `Temporary password: ${password}`,
      "",
      "Please sign in and reset your password.",
    ].join("\n");

    const transporter = this.transporter();

    try {
      await transporter.sendMail({
        from,
        to: email,
        subject,
        text,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown SMTP error";
      throw new Error(`Unable to send password email: ${message}`);
    }
  }
}

export default new MailService();
