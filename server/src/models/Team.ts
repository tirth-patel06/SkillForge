// server/src/models/Team.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export type TeamMemberRole = "LEADER" | "MEMBER";

export interface ITeamMember {
  user: Types.ObjectId;
  role: TeamMemberRole;
  joinedAt: Date;
}

export interface ITeam extends Document {
  name: string;
  description?: string;
  techStack: string[];
  leader: Types.ObjectId;
  mentor: Types.ObjectId;
  members: ITeamMember[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["LEADER", "MEMBER"], required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TeamSchema = new Schema<ITeam>(
  {
    name: { type: String, required: true },
    description: { type: String },
    techStack: [{ type: String }],
    leader: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mentor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: { type: [TeamMemberSchema], default: [] },
    inviteCode: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

export const Team =
  mongoose.models.Team || mongoose.model("Team", TeamSchema);
