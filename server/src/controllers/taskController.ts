import type { Response } from "express";
import type { AuthRequest } from "../types/auth";
import { Task } from "../models/Task";
import { RubricCriteria } from "../models/MentorSystem";

// GET /api/tasks - list tasks created by current mentor (optional status filter)
export const getMyTasks = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "MENTOR") {
      return res.status(403).json({ message: "Mentor access only" });
    }

    const { status } = req.query as { status?: string };

    const query: any = { createdBy: req.user.id };
    if (status && ["PENDING", "ACTIVE", "APPROVED", "REJECTED", "REMOVED"].includes(status)) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    const formatted = tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description,
      difficulty: t.difficulty,
      techStack: t.techStack || [],
      expectedTeamSize: t.expectedTeamSize,
      deadline: t.deadline ? t.deadline.toISOString() : null,
      status: t.status,
      createdAt: t.createdAt ? t.createdAt.toISOString() : new Date().toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error("Get tasks error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "MENTOR") {
      return res.status(403).json({ message: "Mentor access only" });
    }

    const {
      title,
      description,
      difficulty,
      techStack,
      expectedTeamSize,
      deadline,
      rubric,
    } = req.body as {
      title: string;
      description: string;
      difficulty?: "EASY" | "MEDIUM" | "HARD";
      techStack?: string[];
      expectedTeamSize?: number;
      deadline?: string | null;
      rubric?: {
        name: string;
        description?: string;
        weightage: number;
        orderIndex?: number;
      }[];
    };

    // basic validation if needed
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const task = await Task.create({
      title,
      description,
      difficulty: difficulty || "MEDIUM",
      techStack: techStack || [],
      expectedTeamSize,
      deadline: deadline ? new Date(deadline) : undefined,
      createdBy: req.user.id,          // User _id from JWT
      status: "PENDING",               // mentor-created → pending by default
    });

    // Create rubric criteria records linked to this task
    if (rubric && rubric.length > 0) {
      await RubricCriteria.insertMany(
        rubric.map((r, index) => ({
          taskId: task._id,
          name: r.name,
          description: r.description || "",
          weightage: r.weightage,
          orderIndex: r.orderIndex ?? index, // fallback to array index
        }))
      );
    }

    return res.status(201).json(task);
  } catch (err) {
    console.error("Create task error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/tasks/:id - soft remove a task created by the mentor
export const removeTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "MENTOR") {
      return res.status(403).json({ message: "Mentor access only" });
    }

    const { id } = req.params;

    const task = await Task.findOne({ _id: id, createdBy: req.user.id });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = "REMOVED";
    await task.save();

    return res.status(200).json({ message: "Task removed", id });
  } catch (err) {
    console.error("Remove task error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
