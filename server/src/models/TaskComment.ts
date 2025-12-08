import mongoose, { Schema, Document } from "mongoose";

export interface ITaskComment extends Document {
  taskId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId; // User who posted the comment
  authorRole: "MENTOR" | "STUDENT" | "ADMIN"; // Role of the author
  authorName: string; // Cached author name for quick display
  authorEmail: string; // For identity verification
  authorProfilePhoto?: string; // Profile photo URL
  content: string;
  parentCommentId?: mongoose.Types.ObjectId; // For nested replies
  likes: mongoose.Types.ObjectId[]; // Array of user IDs who liked
  edited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskCommentSchema = new Schema<ITaskComment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorRole: {
      type: String,
      enum: ["MENTOR", "STUDENT", "ADMIN"],
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorEmail: {
      type: String,
      required: true,
    },
    authorProfilePhoto: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 5000,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: "TaskComment",
      default: null,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
taskCommentSchema.index({ taskId: 1, createdAt: -1 });
taskCommentSchema.index({ authorId: 1 });
taskCommentSchema.index({ parentCommentId: 1 });

export default mongoose.model<ITaskComment>("TaskComment", taskCommentSchema);
