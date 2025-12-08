import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/auth";

export const requireAdmin= (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "ADMIN access only" });
  }
  return next();
};