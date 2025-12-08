import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthRequest, JwtPayload } from "../types/auth";

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  // 1️⃣ Prefer Authorization header if present
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  }

  // 2️⃣ Fallback to httpOnly cookie (set on login)
  if (!token && (req as any).cookies?.token) {
    token = (req as any).cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not set");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;

    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};