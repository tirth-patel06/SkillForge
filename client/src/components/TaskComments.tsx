"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Heart, Trash2, Edit2, Reply, Send } from "lucide-react";

interface Comment {
  _id: string;
  taskId: string;
  authorId: string;
  authorRole: "MENTOR" | "STUDENT" | "ADMIN";
  authorName: string;
  authorEmail: string;
  authorProfilePhoto?: string;
  content: string;
  parentCommentId?: string;
  likes: Array<string | { _id: string }>;
  edited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskCommentsProps {
  taskId: string;
  taskTitle: string;
}

export function TaskComments({ taskId, taskTitle }: TaskCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const replyTextareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/${taskId}/comments`);
      if (res.data.success) {
        setComments(res.data.comments);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  // Fetch comments on mount
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await api.post(`/tasks/${taskId}/comments`, {
        content: newComment,
      });
      if (res.data.success) {
        setNewComment("");
        fetchComments();
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = useCallback(async (parentId: string) => {
    const textarea = replyTextareaRefs.current[parentId];
    const replyContent = textarea?.value || "";
    
    if (!replyContent?.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await api.post(`/tasks/${taskId}/comments`, {
        content: replyContent,
        parentCommentId: parentId,
      });
      if (res.data.success) {
        if (textarea) {
          textarea.value = "";
        }
        setReplyingTo(null);
        fetchComments();
      }
    } catch (err) {
      console.error("Error posting reply:", err);
      setError("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  }, [taskId, fetchComments]);

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await api.put(`/comments/${commentId}`, {
        content: editContent,
      });
      if (res.data.success) {
        setEditingId(null);
        setEditContent("");
        fetchComments();
      }
    } catch (err) {
      console.error("Error editing comment:", err);
      setError("Failed to edit comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      setError(null);
      const res = await api.delete(`/comments/${commentId}`);
      if (res.data.success) {
        fetchComments();
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment");
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const res = await api.post(`/comments/${commentId}/like`);
      if (res.data.success) {
        fetchComments();
      }
    } catch (err) {
      console.error("Error liking comment:", err);
      setError("Failed to like comment");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "MENTOR":
        return "bg-blue-900/30 text-blue-400 border-blue-700";
      case "STUDENT":
        return "bg-green-900/30 text-green-400 border-green-700";
      case "ADMIN":
        return "bg-purple-900/30 text-purple-400 border-purple-700";
      default:
        return "bg-zinc-800 text-zinc-400";
    }
  };

  // Separate replies from top-level comments
  const { topLevelComments, repliesByParent } = useMemo(() => {
    const top: Comment[] = [];
    const replies: Record<string, Comment[]> = {};

    comments.forEach((comment) => {
      if (!comment.parentCommentId) {
        top.push(comment);
      } else {
        if (!replies[comment.parentCommentId]) {
          replies[comment.parentCommentId] = [];
        }
        replies[comment.parentCommentId].push(comment);
      }
    });

    return { topLevelComments: top, repliesByParent: replies };
  }, [comments]);

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const canEdit = user?.id === comment.authorId;
    const canDelete = user?.id === comment.authorId || user?.role === "ADMIN";
    const isLiked = comment.likes.some((like) => 
      typeof like === 'string' ? like === user?.id : like._id === user?.id
    );
    const replies = repliesByParent[comment._id] || [];

    return (
      <div
        className={`${
          isReply ? "ml-8 border-l-2 border-zinc-700 pl-4" : ""
        } mb-4 pb-4`}
      >
        <div className="bg-zinc-900/50 rounded-lg p-4 hover:bg-zinc-900/70 transition-colors">
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-3">
              {comment.authorProfilePhoto ? (
                <img
                  src={comment.authorProfilePhoto}
                  alt={comment.authorName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center text-xs font-semibold">
                  {comment.authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-white">
                    {comment.authorName}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${getRoleColor(
                      comment.authorRole
                    )}`}
                  >
                    {comment.authorRole}
                  </span>
                </div>
                <span className="text-xs text-zinc-500">
                  {new Date(comment.createdAt).toLocaleDateString()}{" "}
                  {new Date(comment.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {comment.edited && <span className="ml-2">(edited)</span>}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {canEdit && (
                <button
                  onClick={() => {
                    setEditingId(comment._id);
                    setEditContent(comment.content);
                  }}
                  className="p-1 hover:bg-zinc-800 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-zinc-400 hover:text-zinc-200" />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDelete(comment._id)}
                  className="p-1 hover:bg-red-900/30 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                </button>
              )}
            </div>
          </div>

          {/* Comment Content */}
          {editingId === comment._id ? (
            <div className="mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 text-sm mb-2"
                placeholder="Edit your comment..."
                rows={3}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(comment._id)}
                  disabled={submitting}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-white/90 text-sm mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Comment Actions */}
          <div className="flex items-center space-x-4 text-xs">
            <button
              onClick={() => handleLike(comment._id)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                isLiked
                  ? "bg-red-900/30 text-red-400"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              <Heart
                className={`w-3 h-3 ${isLiked ? "fill-red-400" : ""}`}
              />
              <span>{comment.likes.length}</span>
            </button>
            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment._id)}
                className="flex items-center space-x-1 px-2 py-1 text-zinc-400 hover:bg-zinc-800 rounded transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {replyingTo === comment._id && (
          <div className="mt-3 ml-8 bg-zinc-900/30 rounded-lg p-3">
            <textarea
              ref={(el) => {
                replyTextareaRefs.current[comment._id] = el;
              }}
              defaultValue=""
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 text-sm mb-2"
              placeholder="Write a reply..."
              rows={2}
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={() => handleReply(comment._id)}
                disabled={submitting}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium disabled:opacity-50 flex items-center space-x-1"
              >
                <Send className="w-3 h-3" />
                <span>{submitting ? "Posting..." : "Reply"}</span>
              </button>
              <button
                onClick={() => {
                  const textarea = replyTextareaRefs.current[comment._id];
                  if (textarea) {
                    textarea.value = "";
                  }
                  setReplyingTo(null);
                }}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Replies */}
        {!isReply && replies.length > 0 && (
          <div className="mt-3">
            {replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-black rounded-lg p-6 border border-zinc-800">
      <h3 className="text-lg font-bold text-white mb-1">Comments</h3>
      <p className="text-xs text-zinc-500 mb-4">
        Collaborate on: {taskTitle}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* New Comment Form */}
      <div className="mb-6 bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts, ask questions, or help others..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 text-sm mb-3"
          rows={3}
        />
        <button
          onClick={handlePostComment}
          disabled={submitting || !newComment.trim()}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium text-white disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? "Posting..." : "Post Comment"}</span>
        </button>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
          <p className="text-zinc-400 mt-2 text-sm">Loading comments...</p>
        </div>
      ) : topLevelComments.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevelComments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
