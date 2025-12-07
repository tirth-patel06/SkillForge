import { Router } from "express";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// All student routes require authentication
router.use(authMiddleware);

// Placeholder for student endpoints
router.get("/", (_req, res) => {
  res.json({ message: "Students endpoint" });
});

export default router;
