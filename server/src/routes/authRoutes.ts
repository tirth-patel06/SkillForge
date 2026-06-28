// server/src/routes/authRoutes.ts
import { Router } from "express";
import {
  register,
  login,
  verifyEmail,
  me,
  logout,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
const router = Router();
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/logout", logout);

export default router;
