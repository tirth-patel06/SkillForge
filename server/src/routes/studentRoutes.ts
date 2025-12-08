import { Router } from "express";
import { getMyProfile, updateMyProfile, getPublicProfile } from "../controllers/studentProfileController";
import { getStudents } from "../controllers/studentController";
import { requireStudent } from "../middleware/requireStudent";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /api/students/me/profile
router.get("/me/profile", requireAuth, requireStudent, getMyProfile);

// PUT /api/students/me/profile
router.put("/me/profile", requireAuth, requireStudent, updateMyProfile);

// PUBLIC route (no auth required for now)
router.get("/:id/profile", getPublicProfile);

export default router;
