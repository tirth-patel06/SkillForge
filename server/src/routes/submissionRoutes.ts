import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All submission routes require authentication
router.use(authMiddleware);

// Placeholder for submission endpoints
router.get("/", (_req, res) => {
  res.json({ message: "Submissions endpoint" });
});

export default router;
