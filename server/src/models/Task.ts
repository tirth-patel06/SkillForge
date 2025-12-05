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

const TaskSchema = new Schema<ITask>({
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