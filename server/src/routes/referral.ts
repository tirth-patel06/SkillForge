// src/routes/referrals.ts
import express from "express";
import { Referral } from "../models/Refferal";
import { User } from "../models/User";
import { signJwt } from "../utils/createJwt";
//import { createReferralPdf } from "../utils/pdf";
import { Notification } from "../models/Notification";

const router = express.Router();

router.get("/", async (req, res) => {
  const status = req.query.status as string || undefined;
  const q:any = {};
  if (status) q.status = status;
  const refs = await Referral.find(q).populate("mentorId studentId", "email name");
  res.json(refs);
});

router.patch("/:id/approve", async (req, res) => {
  const { adminId, note } = req.body;
  const ref = await Referral.findById(req.params.id).populate("mentorId studentId");
  if (!ref) return res.status(404).json({ error: "not found" });

  ref.status = "APPROVED";

  const token = signJwt({ referralId: ref._id.toString(), mentorId: ref.mentorId, studentId: ref.studentId }, "90d");
  ref.signedToken = token;


  const mentorEmail = (ref as any).mentorId.email;
  const studentEmail = (ref as any).studentId.email;
 //const pdfPath = await createReferralPdf({ mentorEmail, studentEmail, reason: ref.reason, evidence: ref.evidence, token });
  //ref.pdfUrl = pdfPath;

  await ref.save();

  await Notification.create({ userId: ref.mentorId, message: `Referral ${ref._id} approved.`, type: "success" });
  await Notification.create({ userId: ref.studentId, message: `You received a referral from your mentor.`, type: "success" });

  res.json({ ok: true, ref });
});

export default router;
