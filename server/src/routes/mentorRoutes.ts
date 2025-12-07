import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireMentor } from "../middleware/requireMentor";
import { getMentorDashboard } from "../controllers/mentorController";

const router = Router();

// All mentor routes require authentication
router.use(authMiddleware);

// Get mentor dashboard
router.get("/dashboard", requireMentor, getMentorDashboard);

export default router;
