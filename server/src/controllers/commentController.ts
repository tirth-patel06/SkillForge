import { Response } from "express";
import TaskComment from "../models/TaskComment";
import { Task } from "../models/Task";
import { AuthRequest } from "../types/auth";

// Get all comments for a task
export const getTaskComments = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { parentCommentId } = req.query;

    const query: any = { taskId };
    
    // If parentCommentId is provided, filter by it
    if (parentCommentId) {
      query.parentCommentId = parentCommentId;
    }

    const comments = await TaskComment.find(query)
      .sort({ createdAt: -1 })
      .populate("authorId", "name email profilePhotoUrl")
      .populate("likes", "_id")
      .lean();

    res.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

// Create a new comment
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { taskId } = req.params;
    const { content, parentCommentId } = req.body;

    // Validate input
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // If it's a reply, verify parent comment exists
    if (parentCommentId) {
      const parentComment = await TaskComment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    const comment = new TaskComment({
      taskId,
      authorId: req.user.id,
      authorRole: req.user.role,
      authorName: req.user.name || req.user.email,
      authorEmail: req.user.email,
      content: content.trim(),
      parentCommentId: parentCommentId || null,
      likes: [],
      edited: false,
    });

    await comment.save();

    const populatedComment = await TaskComment.findById(comment._id)
      .populate("authorId", "name email profilePhotoUrl")
      .populate("likes", "_id");

    console.log(`✅ Comment created by ${req.user.email} on task ${taskId}`);

    res.status(201).json({
      success: true,
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Failed to create comment" });
  }
};

// Update a comment (only author can edit)
export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { commentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const comment = await TaskComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only author or admins can edit
    if (comment.authorId.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Cannot edit another user's comment" });
    }

    comment.content = content.trim();
    comment.edited = true;
    comment.editedAt = new Date();
    await comment.save();

    const populatedComment = await TaskComment.findById(comment._id)
      .populate("authorId", "name email profilePhotoUrl")
      .populate("likes", "_id");

    console.log(`✅ Comment ${commentId} updated by ${req.user.email}`);

    res.json({
      success: true,
      comment: populatedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Failed to update comment" });
  }
};

// Delete a comment (author or admin only)
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { commentId } = req.params;

    const comment = await TaskComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only author or admins can delete
    if (comment.authorId.toString() !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Cannot delete another user's comment" });
    }

    // Delete the comment and all its replies
    await TaskComment.deleteMany({
      $or: [
        { _id: commentId },
        { parentCommentId: commentId },
      ],
    });

    console.log(`✅ Comment ${commentId} deleted by ${req.user.email}`);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};

// Like/unlike a comment
export const toggleCommentLike = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { commentId } = req.params;

    const comment = await TaskComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userId = req.user.id;
    const userIdObj = userId.toString();
    const alreadyLiked = comment.likes.some(
      (id) => id.toString() === userIdObj
    );

    if (alreadyLiked) {
      // Unlike
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userIdObj
      );
    } else {
      // Like
      comment.likes.push(userId as any);
    }

    await comment.save();

    const populatedComment = await TaskComment.findById(comment._id)
      .populate("authorId", "name email profilePhotoUrl")
      .populate("likes", "_id");

    res.json({
      success: true,
      comment: populatedComment,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Failed to toggle like" });
  }
};

// Get comment threads (comment + all replies)
export const getCommentThread = async (req: AuthRequest, res: Response) => {
  try {
    const { commentId } = req.params;

    const parentComment = await TaskComment.findById(commentId)
      .populate("authorId", "name email profilePhotoUrl")
      .populate("likes", "_id");

    if (!parentComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const replies = await TaskComment.find({ parentCommentId: commentId })
      .sort({ createdAt: 1 })
      .populate("authorId", "name email profilePhotoUrl")
      .populate("likes", "_id");

    res.json({
      success: true,
      parent: parentComment,
      replies,
    });
  } catch (error) {
    console.error("Error fetching comment thread:", error);
    res.status(500).json({ message: "Failed to fetch comment thread" });
  }
};
