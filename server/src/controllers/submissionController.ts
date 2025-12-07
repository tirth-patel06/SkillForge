import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { Submission, RubricCriteria, SubmissionScore } from "../models/MentorSystem";
import { Task } from "../models/Task";
import { User } from "../models/User";
import mongoose from "mongoose";

// GET /submissions - Get all submissions for current user
export const getSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get submissions where user is the student or reviewer
    const submissions = await Submission.find({
      $or: [{ studentId: userId }, { reviewerId: userId }],
    })
      .populate("taskId", "title description difficulty")
      .populate("studentId", "name email")
      .populate("reviewerId", "name email")
      .populate("teamId", "name")
      .select("-__v");

    return res.status(200).json({
      message: "Submissions retrieved successfully",
      submissions,
    });
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
    }).select("-__v");

    return res.status(200).json({
      message: "Rubric criteria retrieved successfully",
      taskId,
      criteria,
    });
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

    // Save scores for each criteria if provided
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
