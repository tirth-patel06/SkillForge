import mongoose, { Schema, Document, Model } from "mongoose";

export type TaskStatus = "PENDING" | "ACTIVE" | "APPROVED" | "REJECTED" | "REMOVED";
// PENDING, ACTIVE, REJECTED – for mentor status
// APPROVED, REMOVED – for admin control

export interface ITask extends Document {
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  techStack: string[];
  expectedTeamSize?: number;
  estimatedHours?: number;
  deadline?: Date;
  createdBy: mongoose.Types.ObjectId; // mentor (User) id
  status: TaskStatus;
  modNotes?: string; // notes by admin/mentor
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: String,
  difficulty: {
    type: String,
    enum: ["EASY", "MEDIUM", "HARD"],
    default: "MEDIUM",
  },
  techStack: [String],
  expectedTeamSize: Number,
  estimatedHours: Number,
  deadline: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["PENDING", "ACTIVE", "APPROVED", "REJECTED", "REMOVED"],
    default: "PENDING",
  },
  modNotes: String,
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

export const Task: Model<ITask> = mongoose.model<ITask>("Task", TaskSchema);
