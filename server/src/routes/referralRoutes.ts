import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getMyReferrals, createReferral, updateReferralStatus } from "../controllers/referralController";

const router = Router();

// All referral routes require authentication
router.use(authMiddleware);

// Get my referrals
router.get("/my", getMyReferrals);

// Create a new referral
router.post("/", createReferral);

// Update referral status
router.patch("/:id", updateReferralStatus);

export default router;
