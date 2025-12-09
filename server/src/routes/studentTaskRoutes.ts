// server/src/routes/studentTaskRoutes.ts
import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import type { AuthRequest } from "../types/auth";
import { Task } from "../models/Task";
import { Submission } from "../models/MentorSystem";
import mongoose from "mongoose";

const router = Router();

// All these routes require auth
router.use(authMiddleware);

// Small guard: only STUDENTs should access
router.use((req, res, next) => {
  const user = (req as AuthRequest).user;
  if (!user || user.role !== "STUDENT") {
    return res.status(403).json({ message: "Student access only" });
  }
  next();
});

/**
 * STEP 1A: Explore Active Tasks
 * GET /api/students/tasks/active
 * Query: ?difficulty=EASY|MEDIUM|HARD&tech=React,Node&search=string
 */
router.get("/active", async (req: AuthRequest, res) => {
  try {
    const { difficulty, tech, search } = req.query as {
      difficulty?: "EASY" | "MEDIUM" | "HARD";
      tech?: string;
      search?: string;
    };

    const filter: any = {
      status: "ACTIVE", // only tasks that admin/mentor made available
    };

    if (difficulty && ["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      filter.difficulty = difficulty;
    }

    if (tech) {
      const tags = tech
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tags.length > 0) {
        filter.techStack = { $in: tags };
      }
    }

    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 }) // latest on top
      .select("-__v")
      .lean();

    // Shape similar to TaskItem
    const formatted = tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      difficulty: t.difficulty,      // "EASY" | "MEDIUM" | "HARD"
      techStack: t.techStack || [],
      expectedTeamSize: t.expectedTeamSize,
      deadline: t.deadline ? t.deadline.toISOString() : null,
      status: t.status,              // still TaskStatus
      createdAt: t.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error("Student active tasks error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * STEP 1B: Enroll in a task
 * POST /api/students/tasks/:taskId/enroll
 * → create a Submission for (student, task) with status "PENDING"
 */
router.post("/:taskId/enroll", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const task = await Task.findById(taskId);
    if (!task || task.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Task is not active or not available" });
    }

    // Check if already have a submission for this task
    const existing = await Submission.findOne({
      taskId,
      studentId: user.id,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "You already have a submission/enrollment for this task" });
    }

    // Create submission acting as "enrollment"
    const submission = await Submission.create({
      taskId: task._id,
      studentId: user.id,
      status: "PENDING",       // waiting for mentor review (once content is added)
      githubUrl: undefined,    // will be filled later
      fileUrls: [],
      files: [],
      notes: undefined,        // will store description later
      submittedAt: undefined,  // will be set only when student actually submits
    });

    return res.status(201).json({
      message: "Enrolled successfully",
      submissionId: submission._id.toString(),
    });
  } catch (err) {
    console.error("Enroll error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * STEP 1C: List enrolled tasks for current student
 * GET /api/students/tasks/enrolled
 */
router.get("/enrolled", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;

    const submissions = await Submission.find({ studentId: user.id })
      .populate("taskId")
      .sort({ submittedAt: -1 })
      .lean();

    const items = submissions
      .filter((s) => s.taskId) // ignore if task got deleted
      .map((s: any) => {
        const t = s.taskId;
        return {
          submissionId: s._id.toString(),
          taskId: t._id.toString(),
          title: t.title,
          description: t.description,
          difficulty: t.difficulty,
          techStack: t.techStack || [],
          expectedTeamSize: t.expectedTeamSize,
          deadline: t.deadline ? t.deadline.toISOString() : null,
          taskStatus: t.status,           // TaskStatus
          submissionStatus: s.status,     // "PENDING" | "APPROVED" | "CHANGES_REQUESTED"
          githubUrl: s.githubUrl || "",
          workDescription: s.notes || "",
          submittedAt: s.submittedAt || null,
          enrolledAt: s.submittedAt || s.createdAt, // initial time
        };
      });

    return res.status(200).json(items);
  } catch (err) {
    console.error("Student enrolled tasks error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * STEP 1D: Submit work (GitHub + description) for a task
 * POST /api/students/tasks/:taskId/submit
 * Body: { githubUrl, description }
 */
router.post("/:taskId/submit", async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { taskId } = req.params;
    const { githubUrl, description } = req.body as {
      githubUrl: string;
      description: string;
    };

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    if (!githubUrl?.trim() || !description?.trim()) {
      return res
        .status(400)
        .json({ message: "GitHub URL and description are required" });
    }

    // Find existing submission (enrollment)
    let submission = await Submission.findOne({
      taskId,
      studentId: user.id,
    });

    if (!submission) {
      // if student never enrolled, create a new submission now
      submission = new Submission({
        taskId,
        studentId: user.id,
        fileUrls: [],
        files: [],
      });
    }

    submission.githubUrl = githubUrl.trim();
    submission.notes = description.trim();
    submission.submittedAt = new Date();
    submission.status = "PENDING"; // waiting for mentor review

    await submission.save();

    return res.status(200).json({
      message: "Work submitted successfully",
      submissionId: submission._id.toString(),
    });
  } catch (err) {
    console.error("Student submit work error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
