import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { Submission, RubricCriteria, SubmissionScore } from "../models/MentorSystem";
import { Task } from "../models/Task";
import { User } from "../models/User";
import mongoose from "mongoose";
import Contribution from "../models/Contribution";
import { emitContributionUpdate } from "../socket";
import { getIO } from "../socket";
// GET /submissions - Get all submissions for current user
export const getSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query based on user role
    let query: any;
    
    if (user.role === "MENTOR") {
      // For mentors: get submissions for tasks they created
      // Only show submissions that have been actually submitted (submittedAt is set)
      const tasks = await Task.find({ createdBy: userId }).select("_id");
      const taskIds = tasks.map(t => t._id);
      query = { taskId: { $in: taskIds }, submittedAt: { $ne: null } };
    } else {
      // For students: get their own submissions
      query = { $or: [{ studentId: userId }, { reviewedBy: userId }] };
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    const submissions = await Submission.find(query)
      .populate("taskId", "title description difficulty")
      .populate("studentId", "name email")
      .populate("reviewedBy", "name email")
      .populate("teamId", "name")
      .select("-__v")
      .lean();

    // Map to frontend format
    const formattedSubmissions = submissions.map(sub => ({
      id: sub._id.toString(),
      task_id: (sub as any).taskId?._id?.toString() || '',
      student_id: (sub as any).studentId?._id?.toString() || '',
      version: sub.version || 1,
      github_url: sub.githubUrl,
      file_urls: sub.fileUrls,
      notes: sub.notes,
      status: sub.status,
      submitted_at: sub.submittedAt?.toISOString() || new Date().toISOString(),
      student_name: (sub as any).studentId?.name || 'Unknown',
      task_title: (sub as any).taskId?.title || 'Unknown Task',
      review: sub.review ? {
        feedback: sub.review.feedback || '',
      } : undefined,
    }));

    return res.status(200).json(formattedSubmissions);
  } catch (error) {
    console.error("Get submissions error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /tasks/rubric/:taskId - Get rubric criteria for a task
export const getTaskRubric = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Get all rubric criteria for this task
    const criteria = await RubricCriteria.find({
      taskId: taskId,
    }).select("-__v").lean();

    // Map to frontend format
    const formattedCriteria = criteria.map(c => ({
      id: c._id.toString(),
      name: c.name,
      description: c.description || '',
      weightage: c.weightage,
    }));

    return res.status(200).json(formattedCriteria);
  } catch (error) {
    console.error("Get task rubric error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /submissions/:id/review - Submit review for a submission
export const submitReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, scores, feedback } = req.body;
    const reviewerId = req.user?.id;

    if (!id || !reviewerId) {
      return res
        .status(400)
        .json({ message: "Submission ID and reviewer ID are required" });
    }

    if (!status || !["PENDING", "APPROVED", "CHANGES_REQUESTED"].includes(status)) {
      return res.status(400).json({ message: "Valid status is required" });
    }

    // Get submission
    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Verify reviewer is a mentor
    const reviewer = await User.findById(reviewerId);
    if (!reviewer || reviewer.role !== "MENTOR") {
      return res
        .status(403)
        .json({ message: "Only mentors can review submissions" });
    }

    // Update submission status
    submission.status = status;
    submission.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
    submission.reviewedAt = new Date();
    
    // Update or create review
    if (!submission.review) {
      submission.review = { scores: new Map(), feedback: "" };
    }
    submission.review.feedback = feedback || "";
    await submission.save();
    if (submission.studentId) {
    
    const totalScore = Array.isArray(scores)
    ? scores.reduce((sum, s) => sum + (s.score ?? 0), 0)
    : 0;

    await Contribution.create({
      user: submission.studentId, // ✅ correct field
      type: "REVIEW",
      description: "Mentor scored your submission",
      points: totalScore,
    });

    // realtime notify student
    getIO()
      .to(submission.studentId.toString())
      .emit("contribution:update");
  }
    
  // Fetch the task to get points
    const taskData = await Task.findById(submission.taskId);
    
    await Contribution.create({
    user: submission.studentId,
    type: "TASK",
    description: `Completed task`,
    points: 10,
  });
  console.log("🔥 Emitting contribution update");
  // realtime notify
  if (submission.studentId) {
    getIO().to(submission.studentId.toString()).emit("contribution:update");
  }
    // Log contribution for student
//     if (!task) {
//   return res.status(404).json({ message: "Task not found" });
// }

//   const contribution = await Contribution.create({
//     user: submission.studentId as Types.ObjectId,
//     type: "TASK",
//     description: `Completed task: ${task.title}`,
//     points: task.points ?? 10,
//   });

//   emitContributionUpdate(
//     submission.studentId.toString(),
//     contribution.toObject()
// );


    if (scores && Array.isArray(scores)) {
      for (const score of scores) {
        const existingScore = await SubmissionScore.findOne({
          submissionId: id,
          criteriaId: score.criteriaId,
        });

        if (existingScore) {
          existingScore.score = score.score;
          existingScore.feedback = score.feedback || "";
          await existingScore.save();
        } else {
          const newScore = new SubmissionScore({
            submissionId: id,
            criteriaId: score.criteriaId,
            score: score.score,
            feedback: score.feedback || "",
          });
          await newScore.save();
        }
      }
    }

    // Populate and return
    const updatedSubmission = await Submission.findById(id)
      .populate("taskId", "title")
      .populate("studentId", "name email")
      .populate("reviewedBy", "name email");

    return res.status(200).json({
      message: "Review submitted successfully",
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("Submit review error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /submissions/:id/scores - Get scores for a specific submission
export const getSubmissionScores = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Submission ID is required" });
    }

    // Get submission to verify it exists
    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Get all scores for this submission
    const scores = await SubmissionScore.find({ submissionId: id })
      .select("criteriaId score feedback")
      .lean();

    // Map to frontend format
    const formattedScores = scores.map(s => ({
      criteriaId: s.criteriaId.toString(),
      score: s.score,
      feedback: s.feedback || "",
    }));

    return res.status(200).json(formattedScores);
  } catch (error) {
    console.error("Get submission scores error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
