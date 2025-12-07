import { Response } from "express";
import { AuthRequest } from "../types/auth";
import { User } from "../models/User";

// GET /students - Get all students (for mentor referral selection)
export const getStudents = async (req: AuthRequest, res: Response) => {
  try {
    // Get all users with STUDENT role
    const students = await User.find({ role: "STUDENT" })
      .select("name email")
      .limit(100);

    return res.status(200).json({
      message: "Students retrieved successfully",
      students,
    });
  } catch (error) {
    console.error("Get students error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
