import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All referral routes require authentication
router.use(authMiddleware);

// Placeholder for referral endpoints
router.get("/", (_req, res) => {
  res.json({ message: "Referrals endpoint" });
});

export default router;
