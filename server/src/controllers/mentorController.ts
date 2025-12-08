import type { Response } from "express";
import mongoose from "mongoose";
import type { AuthRequest } from "../types/auth";

import { Task, ITask } from "../models/Task";
import {
  Submission,
  ISubmission,
} from "../models/MentorSystem";
import {Referral,
  IReferral,
} from "../models/Referral";

export const getMentorDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "MENTOR") {
      return res.status(403).json({ message: "Mentor access only" });
    }

    const mentorId = req.user.id; // from JWT

    //Fetch mentor's tasks
    const tasks: ITask[] = await Task.find({
      createdBy: mentorId,
      status: { $in: ["PENDING", "ACTIVE", "APPROVED"] }, 
    }).lean();

    const taskIds = tasks.map((t) => t._id);

    //count pending submissions on these tasks
    const pendingCount = await Submission.countDocuments({
      taskId: { $in: taskIds },
      status: "PENDING", // ✅ uppercase status
    });

    //recent pending submissions (populate student + task)
    const recentPendingSubmissions: (ISubmission & {
      studentId?: { name?: string; email?: string };
      taskId?: { title?: string };
    })[] = await Submission.find({
      taskId: { $in: taskIds },
      status: "PENDING",
    })
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate("studentId", "name email")
      .populate("taskId", "title")
      .lean();

    // recent referrals created by this mentor
    const recentReferrals: (IReferral & {
      studentId?: { name?: string; email?: string };
    })[] = await Referral.find({
      mentorId: new mongoose.Types.ObjectId(mentorId),
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("studentId", "name email")
      .lean();

    //Count referrals by status
    const referralCounts = await Referral.aggregate([
      {
        $match: {
          mentorId: new mongoose.Types.ObjectId(mentorId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const referralsByStatus: Record<string, number> = {};
    referralCounts.forEach((rc) => {
      referralsByStatus[rc._id as string] = rc.count as number;
    });

    //referralRequests = referrals in PENDING state for this mentor
    const referralRequests = referralsByStatus["PENDING"] || 0;

    // Count critical attention tasks
    let criticalAttentionCount = 0;
    
    // REJECTED tasks - Critical
    const rejectedCount = await Task.countDocuments({
      createdBy: mentorId,
      status: "REJECTED",
    });
    criticalAttentionCount += rejectedCount;

    // PENDING tasks for 14+ days - Critical
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const oldPendingCount = await Task.countDocuments({
      createdBy: mentorId,
      status: "PENDING",
      createdAt: { $lt: fourteenDaysAgo },
    });
    criticalAttentionCount += oldPendingCount;

    // ACTIVE tasks with 5+ unreviewed submissions - Critical
    const tasksWithManyUnreviewed = await Submission.aggregate([
      {
        $match: {
          taskId: { $in: taskIds },
          status: "PENDING",
        },
      },
      {
        $group: {
          _id: "$taskId",
          unreviewedCount: { $sum: 1 },
        },
      },
      {
        $match: {
          unreviewedCount: { $gte: 5 },
        },
      },
    ]);
    criticalAttentionCount += tasksWithManyUnreviewed.length;

    const dashboardPayload = {
      pendingReviews: pendingCount,
      activeTasks: tasks.length,
      teamsNeedingAttention: criticalAttentionCount,
      referralRequests,
      recentSubmissions: recentPendingSubmissions.map((sub) => ({
        id: sub._id.toString(),
        student_name: (sub as any).studentId?.name ?? "Unknown",
        task_title: (sub as any).taskId?.title ?? "Unknown Task",
        submitted_at: sub.submittedAt.toISOString(),
      })),
      taskProgress: [], // fill with analytics later
    };

    return res.json(dashboardPayload);
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
