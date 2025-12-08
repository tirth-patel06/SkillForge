import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireMentor } from "../middleware/requireMentor";
import { getMentorDashboard } from "../controllers/mentorController";
import {
  getMentorProfile,
  updateMentorProfile,
  getMentorStats,
} from "../controllers/mentorProfileController";

const router = Router();

// All mentor routes require authentication
router.use(requireAuth);

// Get mentor dashboard
router.get("/dashboard", requireMentor, getMentorDashboard);

// Mentor profile routes
router.get("/me/profile", requireMentor, getMentorProfile);
router.put("/me/profile", requireMentor, updateMentorProfile);

// Mentor stats
router.get("/me/stats", requireMentor, getMentorStats);

export default router;
