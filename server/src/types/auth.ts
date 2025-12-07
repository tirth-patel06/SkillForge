// import { Request } from "express";

// export type UserRole = "STUDENT" | "MENTOR" | "ADMIN";

// export interface JwtUserPayload {
//   id: string;      // User _id
//   role: UserRole;
//   email: string;
// }

// export interface AuthRequest extends Request {
//   user?: JwtUserPayload;
// }

// server/src/types/auth.ts
// server/src/types/auth.ts
import { Request } from "express";

export interface JwtPayload {
  id: string;
  email: string;
  role: "STUDENT" | "MENTOR" | "ADMIN";
  name?: string;
  verified: boolean;
}

// This is the type you're trying to import
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Also augment Express' built-in Request type so you can use plain Request too
declare global {
  namespace Express {
    interface User extends JwtPayload {}
    interface Request {
      user?: JwtPayload;
    }
  }
}

