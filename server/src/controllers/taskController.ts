import type { Response } from "express";
import type { AuthRequest } from "../types/auth";
import { Task } from "../models/Task";
import { RubricCriteria } from "../models/MentorSystem";

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
