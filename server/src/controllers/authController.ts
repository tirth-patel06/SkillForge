// server/src/controllers/authController.ts
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { JwtPayload } from "../types/auth";
import { sendOtpEmail } from "../lib/sendEmail";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRES = "7d";

function createJwt(user: any): string {
  const payload: JwtPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    verified: user.verified,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function setAuthCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password required" });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const user = await User.create({
      email,
      passwordHash,
      name,
      role: role || "STUDENT",
      verified: false,
      otpCode: otp,
      otpExpiresAt,
    });

    // Log OTP for development so you can test without real email
    console.log(`🔐 OTP for ${user.email}: ${otp}`);

    // Fire-and-forget email sending; do NOT block or crash signup
    sendOtpEmail(user.email, otp).catch((err) => {
      console.error("[register] Failed to send OTP email:", err);
    });

    res.status(201).json({
      message: "User created. OTP sent (or logged in server).",
      email: user.email,
    });
  } catch (err) {
    console.error("[register] Internal error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/verify-email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.otpCode) {
      res.status(400).json({ message: "Invalid email or OTP" });
      return;
    }

    if (user.otpCode !== otp) {
      res.status(400).json({ message: "Incorrect OTP" });
      return;
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      res.status(400).json({ message: "OTP expired" });
      return;
    }

    user.verified = true;
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = createJwt(user);
    setAuthCookie(res, token);

    res.json({
      message: "Email verified",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
      },
      token,
    });
  } catch (err) {
    console.error("[verifyEmail] Internal error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.passwordHash) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    if (role && role !== user.role) {
      res.status(400).json({ message: "Role does not match this user" });
      return;
    }

    if (user.banned) {
      res.status(403).json({ message: "Account banned" });
      return;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = createJwt(user);
    setAuthCookie(res, token);

    res.json({
      message: "Logged in",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
      },
      token,
    });
  } catch (err) {
    console.error("[login] Internal error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/auth/me
export const me = (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  res.json({ user: req.user });
};

// POST /api/auth/logout
export const logout = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};

// Used by GitHub callback route after passport auth
export const githubCallbackHandler = (req: Request, res: Response) => {
  const user = req.user as any;
  const token = createJwt(user);
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  // easiest: send token to frontend in query param
  res.redirect(`${frontendUrl}/github-callback?token=${token}`);
};
