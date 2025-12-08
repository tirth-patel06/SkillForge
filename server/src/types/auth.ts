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
  file?: Express.Multer.File;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
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

