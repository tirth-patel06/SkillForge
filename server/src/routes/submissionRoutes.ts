import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getSubmissions, submitReview } from "../controllers/submissionController";

const router = Router();

// All submission routes require authentication
router.use(authMiddleware);

// Get all submissions for current user
router.get("/", getSubmissions);

// Submit review for a submission
router.post("/:id/review", submitReview);

export default router;
