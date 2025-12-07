// server/src/lib/sendEmail.ts
import nodemailer from "nodemailer";

export async function sendOtpEmail(to: string, otp: string) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(
      "[sendOtpEmail] SMTP not configured. Skipping email. OTP =",
      otp,
      "for",
      to
    );
    return;
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465; // true for 465, false for others

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Mentor Hub" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject: "Your Mentor Hub verification code",
      html: `<p>Your verification code is <strong>${otp}</strong>.</p>`,
    });

    console.log("[sendOtpEmail] Sent OTP email:", info.messageId);
  } catch (err) {
    console.error("[sendOtpEmail] Failed to send email:", err);
  }
}
