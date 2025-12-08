import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

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

  console.log("🔐 Auth Check:");
  console.log("  Authorization header:", authHeader ? "✓ present" : "✗ missing");
  console.log("  Bearer token:", bearer ? "✓ present" : "✗ missing");
  console.log("  Cookie token:", req.cookies?.token ? "✓ present" : "✗ missing");
  console.log("  Final token used:", token ? "✓ present" : "✗ missing");

  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    console.log("  ✓ Token verified:", decoded.email);
    next();
  } catch (error: any) {
    console.log("  ✗ Token verification failed:", error.message);
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