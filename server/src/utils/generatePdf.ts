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
 return new Promise<string>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 48, bottom: 48, left: 50, right: 50 },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);


    doc.fontSize(20).font("Helvetica-Bold").text("Referral Packet", {
      align: "center",
    });
    doc.moveDown(1);

  
    doc.fontSize(12).font("Helvetica").text(`Mentor: ${referralData.mentorEmail}`);
    doc.text(`Student: ${referralData.studentEmail}`);
    doc.text(`Date: ${new Date().toISOString()}`);
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica-Bold").text("Reason:");
    doc.moveDown(0.25);
    doc.fontSize(11).font("Helvetica").text(referralData.reason || "No reason provided.");
    doc.moveDown(0.7);

    doc.fontSize(12).font("Helvetica-Bold").text("Evidence:");
    doc.moveDown(0.25);
    if (referralData.evidence && referralData.evidence.length > 0) {
      referralData.evidence.forEach((e, i) => {
        doc.fontSize(11).font("Helvetica").text(`${i + 1}. ${e}`, { continued: false });
      });
    } else {
      doc.fontSize(11).font("Helvetica").text("None provided.");
    }
    doc.moveDown(1);

