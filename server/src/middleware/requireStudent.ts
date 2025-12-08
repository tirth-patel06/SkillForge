import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/auth";

export const requireStudent = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "STUDENT") {
    return res.status(403).json({ message: "Student access only" });
  }

  return next();
};