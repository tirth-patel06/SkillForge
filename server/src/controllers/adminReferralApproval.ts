// src/routes/referrals.ts
import express from "express";
import { Referral } from "../models/Referral";
import { Notification } from "../models/Notification";
import { requireAuth } from "../middleware/auth";
import { requireAdmin } from "../middleware/requireAdmin";
import { signJwt } from "../utils/createJwt";
import { createReferralPdf } from "../utils/generatePdf";

const router = express.Router();


router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const status = (req.query.status as string) || undefined;
    const q: any = {};
    if (status) q.status = status;

    const refs = await Referral.find(q).populate("mentorId studentId", "email name");
    res.json({ refs });
  } catch (err) {
    console.error("GET /referrals error:", err);
    res.status(500).json({ error: "server error" });
  }
  router.patch("/:id/approve", requireAuth, requireAdmin, async (req, res) => {
  try {
    const adminId = req.user?.id; 
    const { note } = req.body;

    const ref = await Referral.findById(req.params.id).populate("mentorId studentId");
    if (!ref) return res.status(404).json({ error: "not found" });


    ref.status = "APPROVED";
   
    // Sign token
    const payload = {
      referralId: ref._id.toString(),
      mentorId: (ref as any).mentorId?._id?.toString?.() || (ref as any).mentorId,
      studentId: (ref as any).studentId?._id?.toString?.() || (ref as any).studentId,
      approvedBy: adminId,
    };
    const token = signJwt(payload, "90d");
    ref.signedToken = token;

    // Generate PDF and set public URL (createReferralPdf returns a public path)
    const mentorEmail = (ref as any).mentorId?.email || "";
    const studentEmail = (ref as any).studentId?.email || "";
    const pdfUrl = await createReferralPdf({
      mentorEmail,
      studentEmail,
      reason: ref.recommendation || "",
      evidence: ref.evidenceLinks || [],
      token,
    });
    ref.pdfUrl = pdfUrl;

    await ref.save();


    // Notifications to mentor and student (if populated references exist)
   // if ((ref as any).mentorId) {
   //   await Notification.create({
     //   userId: (ref as any).mentorId._id || (ref as any).mentorId,
     //   message: `Referral ${ref._id} approved. A referral packet has been generated.`,
      ///  type: "success",
//data: { referralId: ref._id.toString(), pdfUrl },
   //   });
  //  }

  //  if ((ref as any).studentId) {
   //   await Notification.create({
   //     userId: (ref as any).studentId._id || (ref as any).studentId,
    //    message: `You received a referral from your mentor.`,
    //    type: "success",
   //     data: { referralId: ref._id.toString(), pdfUrl },
   //   });
  //  }

    res.json({ ok: true, ref });
  } catch (err) {
    console.error("PATCH /referrals/:id/approve error:", err);
    res.status(500).json({ error: "server error" });
  }
});
});



export default router;
