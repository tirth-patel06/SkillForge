import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireMentor } from "../middleware/requireMentor";
import { upload } from "../middleware/upload";
import { getMentorDashboard } from "../controllers/mentorController";
import {
  getMentorProfile,
  updateMentorProfile,
  getMentorStats,
} from "../controllers/mentorProfileController";
import { uploadMentorProfileImage } from "../controllers/uploadController";

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

// Image upload route
router.post(
  "/me/upload-profile-image",
  requireMentor,
  upload.single("image"),
  uploadMentorProfileImage
);

export default router;