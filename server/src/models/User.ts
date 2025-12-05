// src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";
export type Role = "STUDENT" | "MENTOR" | "ADMIN";

export interface IUser extends Document {
  email: string;
  name?: string;
  passwordHash?: string;
  role: Role;//admin,student,admin
  verified: boolean;   //alumni verification
  banned?: boolean;//banned to remove students or alummi by admin and mentor
  createdAt: Date;
  notifications?: mongoose.Types.ObjectId[]; // notifcations for every user sent either by mentor or admin
}


const UserSchema = new Schema<IUser>({// interfaced instance of user being created
  email: { type: String,
     required: true,
      unique: true },
  name: String,
  passwordHash: String,
  role: { type: String,
     enum: ["STUDENT","MENTOR","ADMIN"],
      default: "STUDENT" },
  verified: { type: Boolean,
     default: false },
  banned: { type: Boolean,
     default: false },
  createdAt: { type: Date,
     default: Date.now }
});