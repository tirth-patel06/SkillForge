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
  createdAt: Date;
}