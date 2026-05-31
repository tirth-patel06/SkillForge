import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import cloudinary from "../config/cloudinary";
export async function createReferralPdf(referralData: {
  mentorEmail: string;
  mentorName?: string;
  studentEmail: string;
  studentName?: string;
  reason: string;
  evidence: string[];
  token: string;
  referralId?: string;
  status?: string;
  issuedAt?: Date;
  issuedBy?: string;
  evidenceCount?: number;
}): Promise<string> {
  const publicDir = path.join(__dirname, "../../public");
  const outDir = path.join(publicDir, "referrals");
  const appName = process.env.APP_NAME || "SkillForge";
  const appUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || "";
  const issuedAt = referralData.issuedAt ? new Date(referralData.issuedAt) : new Date();
  const issuedBy = referralData.issuedBy || `${appName} Admin`;
  const evidenceCount = typeof referralData.evidenceCount === "number"
    ? referralData.evidenceCount
    : referralData.evidence?.length || 0;

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

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const innerWidth = pageWidth - margin * 2;
    const gold = "#C8A951";
    const deep = "#111827";
    const soft = "#F8F5EE";

    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    const formatTime = (date: Date) =>
      date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const safeText = (value: string, fallback: string) =>
      value && value.trim().length > 0 ? value : fallback;

    const clampText = (value: string, maxLength: number) =>
      value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;

    const formatPerson = (name: string | undefined, email: string) => {
      const trimmedName = name?.trim();
      const trimmedEmail = email?.trim();
      if (trimmedName && trimmedEmail) return `${trimmedName} <${trimmedEmail}>`;
      if (trimmedName) return trimmedName;
      if (trimmedEmail) return trimmedEmail;
      return "Not provided";
    };

    const shortToken = referralData.token.length > 60
      ? `${referralData.token.slice(0, 30)}...${referralData.token.slice(-20)}`
      : referralData.token;

    const drawLogo = (x: number, y: number, size: number) => {
      const candidates = [
        path.join(publicDir, "skillforge-logo.png"),
        path.join(publicDir, "logo.png"),
        path.join(publicDir, "brand", "logo.png"),
      ];
      const logoPath = candidates.find((p) => fs.existsSync(p));

      if (logoPath) {
        doc.image(logoPath, x, y, { fit: [size, size], align: "center" });
        return;
      }

      const centerX = x + size / 2;
      const centerY = y + size / 2;
      doc.save();
      doc.lineWidth(2).strokeColor(gold).fillColor(deep);
      doc.circle(centerX, centerY, size / 2).fillAndStroke();
      doc.lineWidth(1).strokeColor("#F5D37B");
      doc.circle(centerX, centerY, size / 2 - 6).stroke();
      doc.fillColor("#F5D37B").font("Helvetica-Bold").fontSize(24);
      doc.text("SF", centerX - size / 2, centerY - 12, {
        width: size,
        align: "center",
      });
      doc.restore();
    };

    const drawLabelValue = (
      label: string,
      value: string,
      x: number,
      y: number,
      width: number
    ) => {
      doc.font("Helvetica").fontSize(9).fillColor("#6B7280");
      doc.text(label.toUpperCase(), x, y, { width });
      doc.font("Helvetica-Bold").fontSize(12).fillColor(deep);
      doc.text(value, x, y + 12, { width });
      return y + 36;
    };

    doc.save();
    doc.rect(0, 0, pageWidth, pageHeight).fill(soft);
    doc.restore();

    doc.save();
    doc.opacity(0.08).strokeColor(gold).lineWidth(1);
    for (let x = -pageHeight; x < pageWidth + pageHeight; x += 28) {
      doc.moveTo(x, 0).lineTo(x + pageHeight, pageHeight).stroke();
    }
    doc.restore();

    doc.save();
    doc.opacity(0.05);
    doc.font("Times-Bold").fontSize(72).fillColor(deep);
    doc.text(appName, 0, pageHeight / 2 - 60, { align: "center" });
    doc.restore();

    const borderInset = 24;
    doc.lineWidth(2).strokeColor(gold);
    doc.rect(borderInset, borderInset, pageWidth - borderInset * 2, pageHeight - borderInset * 2).stroke();
    doc.lineWidth(1).strokeColor("#D6B56B");
    doc.rect(borderInset + 6, borderInset + 6, pageWidth - (borderInset + 6) * 2, pageHeight - (borderInset + 6) * 2).stroke();

    const logoSize = 72;
    const logoY = borderInset + 24;
    drawLogo(pageWidth / 2 - logoSize / 2, logoY, logoSize);

    const titleY = logoY + logoSize - 2;
    const subtitleY = titleY + 34;
    const taglineY = subtitleY + 18;

    doc.font("Times-Bold").fontSize(30).fillColor(deep);
    doc.text("Certificate of Referral", margin, titleY, {
      width: innerWidth,
      align: "center",
    });

    doc.font("Helvetica").fontSize(12).fillColor("#4B5563");
    doc.text(`Issued by ${appName}`, margin, subtitleY, {
      width: innerWidth,
      align: "center",
    });

    doc.font("Helvetica-Oblique").fontSize(11).fillColor("#6B7280");
    doc.text("Verified mentor referral under the official program.", margin, taglineY, {
      width: innerWidth,
      align: "center",
    });

    const dividerY = taglineY + 20;
    doc.lineWidth(1).strokeColor("#E5E7EB");
    doc.moveTo(margin, dividerY).lineTo(pageWidth - margin, dividerY).stroke();

    const infoTop = dividerY + 22;
    const colGap = 20;
    const colWidth = (innerWidth - colGap) / 2;
    let leftY = infoTop;
    let rightY = infoTop;

    leftY = drawLabelValue(
      "Mentor",
      formatPerson(referralData.mentorName, referralData.mentorEmail),
      margin,
      leftY,
      colWidth
    );
    rightY = drawLabelValue(
      "Student",
      formatPerson(referralData.studentName, referralData.studentEmail),
      margin + colWidth + colGap,
      rightY,
      colWidth
    );
    leftY = drawLabelValue("Issued On", formatDate(issuedAt), margin, leftY, colWidth);
    rightY = drawLabelValue(
      "Status",
      safeText(referralData.status || "APPROVED", "APPROVED"),
      margin + colWidth + colGap,
      rightY,
      colWidth
    );
    leftY = drawLabelValue(
      "Referral ID",
      safeText(referralData.referralId || "", "Not provided"),
      margin,
      leftY,
      colWidth
    );
    rightY = drawLabelValue(
      "Evidence Items",
      `${evidenceCount}`,
      margin + colWidth + colGap,
      rightY,
      colWidth
    );

    const reasonTop = Math.max(leftY, rightY) + 10;
    const cardPadding = 14;
    const cardWidth = innerWidth;

    doc.save();
    doc.fillColor("#FFFFFF").strokeColor("#E5E7EB");
    doc.roundedRect(margin, reasonTop, cardWidth, 110, 10).fillAndStroke();
    doc.restore();
    doc.font("Helvetica-Bold").fontSize(12).fillColor(deep);
    doc.text("Reason for Referral", margin + cardPadding, reasonTop + 10);
    doc.font("Helvetica").fontSize(11).fillColor("#374151");
    const reasonText = clampText(
      safeText(referralData.reason, "No reason provided."),
      420
    );
    doc.text(
      reasonText,
      margin + cardPadding,
      reasonTop + 30,
      { width: cardWidth - cardPadding * 2, height: 70, lineGap: 4 }
    );

    let evidenceTop = reasonTop + 130;
    doc.save();
    doc.fillColor("#FFFFFF").strokeColor("#E5E7EB");
    doc.roundedRect(margin, evidenceTop, cardWidth, 115, 10).fillAndStroke();
    doc.restore();
    doc.font("Helvetica-Bold").fontSize(12).fillColor(deep);
    doc.text("Evidence", margin + cardPadding, evidenceTop + 10);
    doc.font("Helvetica").fontSize(11).fillColor("#374151");

    let bulletY = evidenceTop + 30;
    if (referralData.evidence && referralData.evidence.length > 0) {
      const evidenceToShow = referralData.evidence.slice(0, 4);
      evidenceToShow.forEach((item) => {
        const line = `- ${clampText(item, 90)}`;
        doc.text(line, margin + cardPadding, bulletY, {
          width: cardWidth - cardPadding * 2,
        });
        bulletY = doc.y + 2;
      });
      if (referralData.evidence.length > evidenceToShow.length) {
        doc.font("Helvetica-Oblique").text("Additional evidence attached.", margin + cardPadding, bulletY + 4);
      }
    } else {
      doc.text("No evidence provided.", margin + cardPadding, bulletY);
    }

    const verificationTop = evidenceTop + 135;
    doc.font("Helvetica-Bold").fontSize(11).fillColor(deep);
    doc.text("Verification Token (short)", margin, verificationTop);
    doc.font("Courier").fontSize(9).fillColor("#111827");
    doc.text(shortToken, margin, verificationTop + 14, { width: innerWidth });

    const signatureY = pageHeight - 140;
    doc.lineWidth(1).strokeColor(gold);
    doc.moveTo(pageWidth / 2 - 130, signatureY).lineTo(pageWidth / 2 + 130, signatureY).stroke();
    doc.font("Helvetica").fontSize(10).fillColor("#4B5563");
    doc.text(issuedBy, pageWidth / 2 - 130, signatureY + 8, {
      width: 260,
      align: "center",
    });
    doc.font("Helvetica-Oblique").fontSize(9).fillColor("#6B7280");
    doc.text("Authorized Signatory", pageWidth / 2 - 130, signatureY + 24, {
      width: 260,
      align: "center",
    });

    doc.font("Helvetica").fontSize(9).fillColor("#6B7280");
    const footerLine = appUrl ? `${appName} | ${appUrl}` : appName;
    const footerStart = signatureY + 38;
    doc.text("Confidential - For official verification only", margin, footerStart, {
      width: innerWidth,
      align: "center",
    });
    doc.text(footerLine, margin, footerStart + 14, { width: innerWidth, align: "center" });
    doc.text(`Generated ${formatDate(issuedAt)} at ${formatTime(issuedAt)}`, margin, footerStart + 28, {
      width: innerWidth,
      align: "center",
    });

    doc.end();
    stream.on("finish", async () => {
      let cloudUrl: string | null = null;
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: "referrals",
          resource_type: "image", // important for PDF
          public_id: `referral_${Date.now()}`,
        });

        cloudUrl = cloudinary.url(result.public_id, {
          resource_type: "image",
          secure: true,
        });
      } catch (err) {
        console.error("Cloudinary upload failed:", err);

        cloudUrl = "";
      }

      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error("Failed to delete local PDF:", e);
      }

      resolve(cloudUrl);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}