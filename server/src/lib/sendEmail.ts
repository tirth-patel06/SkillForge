// server/src/lib/sendEmail.ts
import { BrevoClient } from "@getbrevo/brevo";


function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildOtpEmailHtml(otp: string, name?: string, role?: string) {
  const appName = process.env.APP_NAME || "SkillForge";
  const safeName = escapeHtml(name || "there");
  const safeRole = escapeHtml(role ? role.toLowerCase() : "member");
  const safeAppName = escapeHtml(appName);
  const safeOtp = escapeHtml(otp);
  const roleKey = (role || "").toLowerCase();
  const roleLabel = roleKey.includes("mentor")
    ? "Mentor"
    : roleKey.includes("admin")
    ? "Admin"
    : roleKey.includes("student")
    ? "Student"
    : "Member";

  const roleActions = roleKey.includes("mentor")
    ? [
        "Create real-world tasks with clear rubrics and deadlines",
        "Review submissions with structured feedback and scores",
        "Track mentee progress and request updates",
        "Write evidence-backed referrals for top contributors",
      ]
    : roleKey.includes("admin")
    ? [
        "Verify users and manage role permissions",
        "Moderate tasks and resolve disputes",
        "Monitor platform activity and analytics",
        "Maintain quality and fairness across reviews",
      ]
    : roleKey.includes("student")
    ? [
        "Join teams and browse tasks with clear rubrics",
        "Submit work in iterations and track your history",
        "Collaborate in task threads and ask for guidance",
        "Earn badges and build a verified portfolio",
      ]
    : [
        "Explore tasks and follow contribution guidelines",
        "Collaborate with mentors and peers",
        "Track submissions and feedback",
      ];

  const actionItems = roleActions
    .map((item) => `<li style="margin:0 0 8px;">${escapeHtml(item)}</li>`)
    .join("");

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
                <p style="margin:16px 0 10px;font-size:15px;line-height:22px;color:#cbd5f5;">${safeAppName} brings open-source style mentorship to campus with transparent reviews, versioned submissions, and clear credit for contributions.</p>
                <div style="margin:14px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Your ${roleLabel} toolkit</div>
                <ul style="margin:8px 0 0 18px;padding:0;color:#e2e8f0;">
                  ${actionItems}
                </ul>
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

async function sendViaBrevo(to: string, otp: string, name?: string, role?: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName =
    process.env.BREVO_SENDER_NAME || process.env.APP_NAME || "Mentor Hub";

  if (!apiKey || !senderEmail) {
    return { ok: false, reason: "BREVO not configured" } as const;
  }

  try {
    const brevo = new BrevoClient({
      apiKey,
      timeoutInSeconds: 30,
    });

    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: "Your SkillForge verification code",
      htmlContent: buildOtpEmailHtml(otp, name, role),
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to, name }],
    });

    console.log("[sendOtpEmail] Sent OTP via Brevo:", result?.messageId);
    return { ok: true } as const;
  } catch (err) {
    console.error("[sendOtpEmail] Brevo failed:", err);
    return { ok: false, reason: "BREVO failed" } as const;
  }
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  name?: string,
  role?: string
) {
  const brevoAttempt = await sendViaBrevo(to, otp, name, role);
  if (brevoAttempt.ok) {
    return;
  }

  console.warn(
    "[sendOtpEmail] Brevo not configured. Skipping email. OTP =",
    otp,
    "for",
    to
  );
}
