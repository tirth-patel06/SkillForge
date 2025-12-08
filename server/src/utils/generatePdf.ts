import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function createReferralPdf(referralData: {
  mentorEmail: string;
  studentEmail: string;
  reason: string;
  evidence: string[];
  token: string;
}): Promise<string> {
  const publicDir = path.join(__dirname, "../../public");
  const outDir = path.join(publicDir, "referrals");

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const filename = `referral_${Date.now()}.pdf`;
  const filePath = path.join(outDir, filename);

