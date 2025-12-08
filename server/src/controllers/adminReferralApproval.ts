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
});



export default router;
