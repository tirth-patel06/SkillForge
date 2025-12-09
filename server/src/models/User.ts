
import { Schema, model, Document } from "mongoose";

export type UserRole = "STUDENT" | "MENTOR" | "ADMIN";

export interface IUser extends Document {
  email: string;
  name?: string;
  passwordHash?: string;
  role: UserRole;
  verified: boolean;
  banned: boolean;
  createdAt: Date;
  otpCode?: string | null;
  otpExpiresAt?: Date | null;
  githubId?: string | null;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  name: String,
  passwordHash: String,
  role: {
    type: String,
    enum: ["STUDENT", "MENTOR", "ADMIN"],
    default: "STUDENT",
  },
  verified: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },

  otpCode: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },

  githubId: { type: String, default: null },
});

export const User = model<IUser>("User", UserSchema);
