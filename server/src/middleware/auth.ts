import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : undefined;

  const token = req.cookies?.token || bearer;

  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      res.status(500).json({ message: "Server misconfigured" });
      return;
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRole(roles: JwtPayload["role"][]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  };
}

// Export as authMiddleware for compatibility with route imports
export const authMiddleware = requireAuth;