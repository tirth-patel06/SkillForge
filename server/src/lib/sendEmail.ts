// server/src/lib/sendEmail.ts
import { Resend } from "resend";


function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildOtpEmailHtml(otp: string, name?: string, role?: string) {
  const appName = process.env.APP_NAME || "Mentor Hub";
  const safeName = escapeHtml(name || "there");
  const safeRole = escapeHtml(role ? role.toLowerCase() : "member");
  const safeAppName = escapeHtml(appName);
  const safeOtp = escapeHtml(otp);

  return `
  <div style="margin:0;padding:0;background:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#0b1220;border:1px solid #1e293b;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
            <tr>
              <td style="padding:28px 32px;background:linear-gradient(135deg,#1d4ed8,#14b8a6);color:#ffffff;">
                <div style="font-size:18px;letter-spacing:2px;font-weight:700;text-transform:uppercase;">${safeAppName}</div>
                <div style="font-size:26px;font-weight:700;margin-top:8px;">Verify your email</div>
                <div style="font-size:14px;margin-top:6px;opacity:0.9;">Welcome ${safeName}, new ${safeRole}.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;color:#e2e8f0;">
                <p style="margin:0 0 12px;font-size:16px;line-height:24px;">Use the verification code below to finish setting up your ${safeAppName} account.</p>
                <div style="margin:18px 0;padding:16px 18px;background:#0f172a;border:1px solid #334155;border-radius:12px;display:inline-block;">
                  <span style="font-size:26px;letter-spacing:6px;font-weight:700;color:#ffffff;">${safeOtp}</span>
                </div>
                <p style="margin:12px 0 0;font-size:14px;color:#94a3b8;">This code expires in 15 minutes. If you did not request it, you can ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 28px;color:#64748b;font-size:12px;">
                Need help? Reply to this email and our team will assist you.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendViaResend(to: string, otp: string, name?: string, role?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || process.env.SMTP_FROM;

  if (!apiKey || !from) {
    return { ok: false, reason: "RESEND not configured" } as const;
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: "Your Mentor Hub verification code",
      html: buildOtpEmailHtml(otp, name, role),
    });

    if (error) {
      console.error("[sendOtpEmail] Resend failed:", error);
      return { ok: false, reason: "RESEND failed" } as const;
    }

    console.log("[sendOtpEmail] Sent OTP via Resend:", data?.id);
    return { ok: true } as const;
  } catch (err) {
    console.error("[sendOtpEmail] Resend failed:", err);
    return { ok: false, reason: "RESEND failed" } as const;
  }
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  name?: string,
  role?: string
) {
  const resendAttempt = await sendViaResend(to, otp, name, role);
  if (resendAttempt.ok) {
    return;
  }

  console.warn(
    "[sendOtpEmail] Resend not configured. Skipping email. OTP =",
    otp,
    "for",
    to
  );
}
