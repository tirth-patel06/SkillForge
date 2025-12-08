import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function createReferralPdf(referralData: {
  mentorEmail: string;
  studentEmail: string;
  reason: string;
  evidence: string[];
  token: string;
})