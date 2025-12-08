import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getCommentThread,
} from "../controllers/commentController";

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(requireAuth);

// Get all comments for a task
router.get("/tasks/:taskId/comments", getTaskComments);

// Create a new comment on a task
router.post("/tasks/:taskId/comments", createComment);

// Update a comment
router.put("/comments/:commentId", updateComment);

// Delete a comment
router.delete("/comments/:commentId", deleteComment);

// Like/unlike a comment
router.post("/comments/:commentId/like", toggleCommentLike);

// Get comment thread (parent + replies)
router.get("/comments/:commentId/thread", getCommentThread);

export default router;
