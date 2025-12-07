import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireMentor } from "../middleware/requireMentor";
import { createTask } from "../controllers/taskController";
import { getTaskRubric } from "../controllers/submissionController";

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

// Create a new task (mentor only)
router.post("/", requireMentor, createTask);

// Get rubric criteria for a task
router.get("/rubric/:taskId", getTaskRubric);

export default router;
