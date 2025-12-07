// server/src/routes/authRoutes.ts
import { Router } from "express";
import passport from "../config/passportGithub";
import {
  register,
  login,
  verifyEmail,
  me,
  logout,
  githubCallbackHandler,
} from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
const router = Router();
router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/logout", logout);

// GitHub
router.get(
  "/github",
  passport.authenticate("github", { session: false })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect:
      (process.env.FRONTEND_URL || "http://localhost:5173") +
      "/auth?error=github",
  }),
  githubCallbackHandler
);

export default router;
