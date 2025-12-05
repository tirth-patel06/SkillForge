import { Request } from "express";

export type UserRole = "STUDENT" | "MENTOR" | "ADMIN";

export interface JwtUserPayload {
  id: string;      // User _id
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtUserPayload;
}
