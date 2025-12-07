import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { getStudents } from "../controllers/studentController";

const router = Router();

// All student routes require authentication
router.use(authMiddleware);

// Get all students
router.get("/", getStudents);

export default router;
