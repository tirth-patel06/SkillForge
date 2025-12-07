import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { requireMentor } from "../middleware/requireMentor";
import { createTask } from "../controllers/taskController";

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

// Create a new task (mentor only)
router.post("/create", requireMentor, createTask);

export default router;
