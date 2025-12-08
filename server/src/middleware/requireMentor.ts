import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/auth";

export const requireMentor = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "MENTOR") {
    return res.status(403).json({ message: "Mentor access only" });
  }

  return next();
};