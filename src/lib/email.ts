import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMagicLinkEmail(email: string, token: string) {
  const baseUrl = process.env.MAGIC_LINK_BASE_URL || "http://localhost:3000";
  const magicLink = `${baseUrl}/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "AddVoice <noreply@addvoice.io>",
    to: email,
    subject: "🎬 Your AddVoice Login Link",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 24px; color: #7c3aed;">🎬 AddVoice</h1>
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Click the button below to sign in to your AddVoice account:
        </p>
        <a href="${magicLink}" 
           style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; margin: 24px 0;">
          Sign In to AddVoice →
        </a>
        <p style="font-size: 13px; color: #9ca3af; margin-top: 24px;">
          This link expires in 15 minutes. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
}
