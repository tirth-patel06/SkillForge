import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireMentor } from "../middleware/requireMentor";
import { createTask, getMyTasks, removeTask, getTaskDetail } from "../controllers/taskController";
import { getTaskRubric } from "../controllers/submissionController";

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

// Get mentor's tasks
router.get("/", requireMentor, getMyTasks);

// Create a new task (mentor only)
router.post("/", requireMentor, createTask);

// Get detail for a specific task (all authenticated users)
router.get("/:taskId", getTaskDetail);

// Get rubric criteria for a task
router.get("/rubric/:taskId", getTaskRubric);

// Remove a task (soft delete)
router.delete("/:id", requireMentor, removeTask);

export default router;
