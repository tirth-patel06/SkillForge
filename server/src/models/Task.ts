<<<<<<< HEAD
import mongoose, { Schema, Document } from "mongoose";
export type TaskStatus= "PENDING"|"ACTIVE"|"APPROVED"|"REJECTED"|"REMOVED"
// pending,active,rejected-for mentor status
//approved,removed for admin control
export interface ITask extends Document {
  title: string;
  description: string;
  difficulty: "EASY"|"MEDIUM"|"HARD";
  techStack: string[];
  expectedTeamSize?: number;
  deadline?: Date;
  createdBy: mongoose.Types.ObjectId; // mentor id
  status: TaskStatus;
  modNotes?: string;// notes for a task given by either admin or the mentor
=======
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
  deadline?: Date;
  createdBy: mongoose.Types.ObjectId; // mentor (User) id
  status: TaskStatus;
  modNotes?: string; // notes by admin/mentor
>>>>>>> 4f9a9280364af8ceadbdbff65572b9e7bd6f754c
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>({
<<<<<<< HEAD
  title: { type: String,
     required: true },
  description: String,
  difficulty: { type: String, 
    enum: ["EASY","MEDIUM","HARD"], 
    default: "MEDIUM" },
  techStack: [String],
  expectedTeamSize: Number,
  deadline: Date,
  createdBy: { type: Schema.Types.ObjectId },
  status: { type: String, enum: ["PENDING","ACTIVE","APPROVED","REJECTED","REMOVED"], default: "PENDING" },
  modNotes: String,
  createdAt: { type: Date, default: Date.now }
});

export const Task = mongoose.model<ITask>("Task", TaskSchema);
=======
  title: { type: String, required: true },
  description: String,
  difficulty: {
    type: String,
    enum: ["EASY", "MEDIUM", "HARD"],
    default: "MEDIUM",
  },
  techStack: [String],
  expectedTeamSize: Number,
  deadline: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["PENDING", "ACTIVE", "APPROVED", "REJECTED", "REMOVED"],
    default: "PENDING",
  },
  modNotes: String,
  createdAt: { type: Date, default: Date.now },
});

export const Task: Model<ITask> = mongoose.model<ITask>("Task", TaskSchema);
>>>>>>> 4f9a9280364af8ceadbdbff65572b9e7bd6f754c
