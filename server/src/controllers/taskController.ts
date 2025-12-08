import type { Response } from "express";
import type { AuthRequest } from "../types/auth";
import { Task } from "../models/Task";
import { RubricCriteria, Submission } from "../models/MentorSystem";

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

// GET /api/tasks/:taskId - get detailed info for a single task
export const getTaskDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
      .populate("createdBy", "name email")
      .lean();

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Get rubric criteria for this task
    const rubric = await RubricCriteria.find({ taskId })
      .sort({ orderIndex: 1 })
      .lean();

    // Get submissions for this task
    const submissions = await Submission.find({ taskId })
      .select("_id studentId teamId status submittedAt")
      .lean();

    // Get unique enrolled students (from submissions and StudentEnrollment if exists)
    const enrolledStudentIds = Array.from(
      new Set(submissions.map((s) => s.studentId?.toString()).filter(Boolean))
    );

    // Format the response
    const formatted = {
      _id: task._id.toString(),
      title: task.title,
      description: task.description,
      status: task.status,
      category: "General", // TODO: Add category field to Task model if needed
      difficultyLevel: task.difficulty,
      skillsRequired: task.techStack || [],
      estimatedHours: task.estimatedHours || 2,
      mentorId: (task.createdBy as any)?._id?.toString(),
      enrolledStudents: enrolledStudentIds,
      submissions: submissions.map((s) => ({
        _id: s._id.toString(),
        studentId: s.studentId?.toString(),
        status: s.status,
        submittedAt: s.submittedAt,
      })),
      rubric: rubric.length > 0 ? { criteria: rubric } : undefined,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };

    return res.status(200).json({ task: formatted });
  } catch (err) {
    console.error("Get task detail error:", err);
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

// PUT /api/tasks/:taskId - update task details (mentor only, status not editable)
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "MENTOR") {
      return res.status(403).json({ message: "Mentor access only" });
    }

    const { taskId } = req.params;
    const {
      title,
      description,
      difficultyLevel,
      skillsRequired,
      estimatedHours,
    } = req.body;

    // Find task and verify ownership
    const task = await Task.findOne({ _id: taskId, createdBy: req.user.id });
    if (!task) {
      return res.status(404).json({ message: "Task not found or not owned by you" });
    }

    // Only allow editing PENDING tasks (before admin approval)
    if (task.status !== "PENDING") {
      return res.status(400).json({ 
        message: "Only PENDING tasks can be edited. Once approved by admin, tasks cannot be modified." 
      });
    }

    // Update only allowed fields (status is NOT editable by mentors)
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (difficultyLevel !== undefined) task.difficulty = difficultyLevel;
    if (skillsRequired !== undefined) task.techStack = skillsRequired;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;

    await task.save();

    return res.status(200).json({
      message: "Task updated successfully",
      task: {
        _id: task._id,
        title: task.title,
        description: task.description,
        difficulty: task.difficulty,
        techStack: task.techStack,
        estimatedHours: task.estimatedHours,
      },
    });
  } catch (err) {
    console.error("Update task error:", err);
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

// POST /api/tasks/:id/approve - mentor marks their ACTIVE task as APPROVED (completed)
export const approveTask = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== "MENTOR") {
      return res.status(403).json({ message: "Mentor access only" });
    }

    const { id } = req.params;

    const task = await Task.findOne({ _id: id, createdBy: req.user.id });
    if (!task) {
      return res.status(404).json({ message: "Task not found or not owned by you" });
    }

    if (task.status !== "ACTIVE") {
      return res.status(400).json({ message: "Only ACTIVE tasks can be approved" });
    }

    task.status = "APPROVED";
    await task.save();

    return res.status(200).json({ 
      message: "Task approved successfully. Students can no longer enroll.", 
      task: {
        id: task._id,
        status: task.status,
      }
    });
  } catch (err) {
    console.error("Approve task error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
